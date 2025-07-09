import { z } from "zod";
import { ToolDefinition } from "./context/tools";

import { OpenAI } from 'openai';
import { OPENAI_API_KEY, OPENAI_VECTOR_STORE_KEY } from './env';

const openai = new OpenAI({ 
  apiKey: OPENAI_API_KEY,
});

async function getVectorStore(): Promise<OpenAI.VectorStores.VectorStore> {
  const vectorStores = await openai.vectorStores.list();
  
  const matchingStores = vectorStores.data.filter(
    (store: any) => store.metadata?.key === OPENAI_VECTOR_STORE_KEY
  );
  
  if (matchingStores.length === 0) {
    throw new Error(`No vector store found with metadata key: ${OPENAI_VECTOR_STORE_KEY}`);
  }
  
  if (matchingStores.length > 1) {
    console.warn(`Warning: Found ${matchingStores.length} vector stores with metadata key: ${OPENAI_VECTOR_STORE_KEY}. Using the first one.`);
  }

  return matchingStores[0];
}

export async function getVectorStoreId(): Promise<string> {
  const vectorStore = await getVectorStore();
  return vectorStore.id;
}



// Helper function to extract title from file content
function extractTitleFromContent(content: string): string {
  const lines = content.split('\n').filter(line => line.trim());
  
  // Look for markdown headers
  for (const line of lines) {
    if (line.match(/^#+\s+/)) {
      return line.replace(/^#+\s+/, '').trim();
    }
  }
  
  // Look for first non-empty line
  if (lines.length > 0) {
    return lines[0].trim().substring(0, 100);
  }
  
  return 'Untitled Document';
}

// Helper function to extract snippet from content
function extractSnippet(content: string, maxLength: number = 200): string {
  const cleanContent = content.replace(/\n+/g, ' ').trim();
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  return cleanContent.substring(0, maxLength - 3) + '...';
}

// Helper function to extract tags from metadata
function extractTags(metadata: any): string[] {
  if (metadata?.tags) {
    if (Array.isArray(metadata.tags)) {
      return metadata.tags;
    }
    if (typeof metadata.tags === 'string') {
      return metadata.tags.split(',').map((tag: string) => tag.trim());
    }
  }
  return ['general', 'knowledge-base'];
}

export class SearchKnowledgeBaseTool extends ToolDefinition {
    name = "search_knowledge_base";
    description = "Search the knowledge base for relevant articles and solutions using AI-enhanced queries";
    args = z.object({
        query: z.string().describe("The search query to find relevant knowledge base articles"),
        limit: z.number().optional().default(5).describe("Maximum number of results to return")
    });
    result = z.object({
        articles: z.array(z.object({
            id: z.string(),
            title: z.string(),
            snippet: z.string(),
            relevance_score: z.number()
        })),
        total_found: z.number()
    });

    async execute(args: z.infer<typeof this.args>) {
        console.log(`[SearchKnowledgeBase] Starting Assistant API search for: "${args.query}"`);
        
        try {
            // Step 1: Get vector store ID
            const vectorStoreId = await getVectorStoreId();
            console.log(`[SearchKnowledgeBase] Using vector store: ${vectorStoreId}`);
            
            // Step 2: Create an assistant with file_search capability
            console.log(`[SearchKnowledgeBase] Creating assistant with file search capability...`);
            const assistant = await openai.beta.assistants.create({
                name: 'Knowledge Base Search Assistant',
                instructions: `You are a knowledge base search assistant. Search through the provided documents and return relevant information for the user's query. Focus on finding the most relevant content and provide clear, helpful summaries.`,
                model: 'gpt-4o',
                tools: [{ type: 'file_search' }],
                tool_resources: {
                    file_search: {
                        vector_store_ids: [vectorStoreId]
                    }
                }
            });
            
            console.log(`[SearchKnowledgeBase] Created assistant: ${assistant.id}`);
            
            // Step 3: Create a thread for the search
            const thread = await openai.beta.threads.create();
            console.log(`[SearchKnowledgeBase] Created thread: ${thread.id}`);
            
            // Step 4: Add the search query as a message
            await openai.beta.threads.messages.create(thread.id, {
                role: 'user',
                content: `Search the knowledge base for: "${args.query}". Please provide relevant information and cite your sources.`
            });
            
            // Step 5: Run the assistant
            console.log(`[SearchKnowledgeBase] Running assistant search...`);
            const run = await openai.beta.threads.runs.create(thread.id, {
                assistant_id: assistant.id
            });
            
            // Step 6: Wait for completion
            let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            let attempts = 0;
            const maxAttempts = 30; // 30 seconds timeout
            
            while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
                if (attempts >= maxAttempts) {
                    throw new Error('Assistant search timed out');
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
                runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
                attempts++;
            }
            
            console.log(`[SearchKnowledgeBase] Assistant run completed with status: ${runStatus.status}`);
            
            if (runStatus.status === 'failed') {
                throw new Error(`Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
            }
            
            // Step 7: Get the assistant's response
            const messages = await openai.beta.threads.messages.list(thread.id);
            const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
            
            if (assistantMessages.length === 0) {
                throw new Error('No response from assistant');
            }
            
            // Step 8: Parse the response and extract search results
            const response = assistantMessages[0];
            const textContent = response.content.find(content => content.type === 'text');
            
            if (!textContent || textContent.type !== 'text') {
                throw new Error('No text content in assistant response');
            }
            
            const responseText = textContent.text.value;
            const citations = textContent.text.annotations || [];
            
            console.log(`[SearchKnowledgeBase] Retrieved response with ${citations.length} citations`);
            
            // Step 9: Format results
            const articles = citations.slice(0, args.limit).map((citation, index) => {
                // Extract file information from citation
                const fileId = citation.type === 'file_citation' ? citation.file_citation?.file_id : 'unknown';
                
                // Extract snippet from citation text (the text that was replaced by the citation)
                const startIndex = citation.start_index || 0;
                const endIndex = citation.end_index || startIndex + 100;
                const snippet = responseText.substring(startIndex, endIndex) || responseText.substring(0, 200);
                
                return {
                    id: fileId || `result_${index}`,
                    title: `Knowledge Article ${index + 1}`,
                    snippet: snippet,
                    relevance_score: Math.max(0.9 - (index * 0.1), 0.1) // Decreasing relevance
                };
            });
            
            // If no citations, create a single result from the response
            if (articles.length === 0 && responseText.trim()) {
                articles.push({
                    id: 'assistant_response',
                    title: 'Assistant Search Result',
                    snippet: responseText.substring(0, 200),
                    relevance_score: 0.8
                });
            }
            
            // Step 10: Cleanup
            await openai.beta.assistants.del(assistant.id);
            
            console.log(`[SearchKnowledgeBase] Found ${articles.length} relevant results`);
            
            return {
                articles: articles,
                total_found: articles.length
            };
            
        } catch (error) {
            console.error(`[SearchKnowledgeBase] Assistant search failed:`, error);
            
            // Return error in expected format
            return {
                articles: [{
                    id: 'error',
                    title: 'Search Error',
                    snippet: `Failed to search knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    relevance_score: 0.0
                }],
                total_found: 0
            };
        }
    }
}

export class ReadKnowledgeBaseTool extends ToolDefinition {
    name = "read_knowledge_base";
    description = "Read the complete content of a specific knowledge base article by ID";
    args = z.object({
        id: z.string().describe("The knowledge base article ID to read (from search results)")
    });
    result = z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        tags: z.array(z.string()),
        last_updated: z.string()
    });

    async execute(args: z.infer<typeof this.args>) {
        console.log(`[ReadKnowledgeBase] Reading file with Assistant API: ${args.id}`);
        
        try {
            // Step 1: Get vector store ID and verify file exists
            const vectorStoreId = await getVectorStoreId();
            
            // Step 2: Get file metadata from vector store
            let fileMetadata;
            try {
                fileMetadata = await openai.vectorStores.files.retrieve(vectorStoreId, args.id);
                console.log(`[ReadKnowledgeBase] Found file in vector store: ${fileMetadata.id}`);
            } catch (error) {
                console.error(`[ReadKnowledgeBase] File not found in vector store:`, error);
                throw new Error(`File not found in knowledge base: ${args.id}`);
            }
            
            // Step 3: Create an assistant with file_search capability
            console.log(`[ReadKnowledgeBase] Creating assistant to read file content...`);
            const assistant = await openai.beta.assistants.create({
                name: 'Knowledge Base Reader Assistant',
                instructions: `You are a knowledge base reader assistant. When given a specific file ID, provide the complete content of that document in a clear, well-structured format. Include all important information from the document.`,
                model: 'gpt-4o',
                tools: [{ type: 'file_search' }],
                tool_resources: {
                    file_search: {
                        vector_store_ids: [vectorStoreId]
                    }
                }
            });
            
            console.log(`[ReadKnowledgeBase] Created assistant: ${assistant.id}`);
            
            // Step 4: Create a thread for the read request
            const thread = await openai.beta.threads.create();
            console.log(`[ReadKnowledgeBase] Created thread: ${thread.id}`);
            
            // Step 5: Request the specific file content
            await openai.beta.threads.messages.create(thread.id, {
                role: 'user',
                content: `Please provide the complete content of the document with file ID: ${args.id}. Include all text, structure, and important information from this specific document.`
            });
            
            // Step 6: Run the assistant
            console.log(`[ReadKnowledgeBase] Running assistant to read file...`);
            const run = await openai.beta.threads.runs.create(thread.id, {
                assistant_id: assistant.id
            });
            
            // Step 7: Wait for completion
            let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            let attempts = 0;
            const maxAttempts = 30; // 30 seconds timeout
            
            while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
                if (attempts >= maxAttempts) {
                    throw new Error('Assistant read operation timed out');
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
                runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
                attempts++;
            }
            
            console.log(`[ReadKnowledgeBase] Assistant run completed with status: ${runStatus.status}`);
            
            if (runStatus.status === 'failed') {
                throw new Error(`Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
            }
            
            // Step 8: Get the assistant's response
            const messages = await openai.beta.threads.messages.list(thread.id);
            const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
            
            if (assistantMessages.length === 0) {
                throw new Error('No response from assistant');
            }
            
            // Step 9: Extract content from response
            const response = assistantMessages[0];
            const textContent = response.content.find(content => content.type === 'text');
            
            if (!textContent || textContent.type !== 'text') {
                throw new Error('No text content in assistant response');
            }
            
            const fullContent = textContent.text.value;
            const citations = textContent.text.annotations || [];
            
            console.log(`[ReadKnowledgeBase] Retrieved content with ${citations.length} citations`);
            
            // Step 10: Extract metadata and format response
            const title = extractTitleFromContent(fullContent) || `Knowledge Article ${args.id.substring(5, 13)}`;
            const tags = extractTags(fileMetadata);
            const lastUpdated = new Date(fileMetadata.created_at * 1000).toISOString();
            
            // Step 11: Cleanup
            await openai.beta.assistants.del(assistant.id);
            
            return {
                id: args.id,
                title: title,
                content: fullContent,
                tags: tags,
                last_updated: lastUpdated
            };
            
        } catch (error) {
            console.error(`[ReadKnowledgeBase] Failed to read file:`, error);
            
            // Return error in expected format
            return {
                id: args.id,
                title: 'Error Reading File',
                content: `Failed to read knowledge base article: ${error instanceof Error ? error.message : 'Unknown error'}`,
                tags: ['error'],
                last_updated: new Date().toISOString()
            };
        }
    }
}

export class SummarizeUsefulContextTool extends ToolDefinition {
    name = "summarize_useful_context";
    description = "Produces a summary of relevant context for human understanding";
    args = z.object({
        events: z.array(z.any()).describe("Array of events to summarize"),
        focus: z.string().optional().describe("Specific aspect to focus the summary on")
    });
    result = z.object({
        summary: z.string(),
        key_points: z.array(z.string()),
        recommended_actions: z.array(z.string())
    });

    async execute(args: z.infer<typeof this.args>) {
        // Mock implementation
        return {
            summary: "Customer reported login issues. Knowledge base search found relevant articles. Urgency level has been set to medium.",
            key_points: [
                "Customer experiencing login problems",
                "Multiple failed login attempts",
                "Password reset may be needed"
            ],
            recommended_actions: [
                "Send password reset instructions",
                "Monitor for resolution",
                "Follow up in 24 hours"
            ]
        };
    }
}

export class UpdateThreadUrgencyTool extends ToolDefinition {
    name = "update_thread_urgency";
    description = "Update the urgency level of a support thread";
    args = z.object({
        thread_id: z.string().describe("The thread ID to update"),
        urgency: z.enum(["low", "medium", "high", "urgent"]).describe("New urgency level")
    });
    result = z.object({
        thread_id: z.string(),
        old_urgency: z.string(),
        new_urgency: z.string(),
        updated_at: z.string()
    });

    async execute(args: z.infer<typeof this.args>) {
        // Mock implementation
        return {
            thread_id: args.thread_id,
            old_urgency: "medium",
            new_urgency: args.urgency,
            updated_at: new Date().toISOString()
        };
    }
}

export class UpdateThreadCategoryTool extends ToolDefinition {
    name = "update_thread_category";
    description = "Update the category of a support thread";
    args = z.object({
        thread_id: z.string().describe("The thread ID to update"),
        category: z.string().describe("New category for the thread")
    });
    result = z.object({
        thread_id: z.string(),
        old_category: z.string(),
        new_category: z.string(),
        updated_at: z.string()
    });

    async execute(args: z.infer<typeof this.args>) {
        // Mock implementation
        return {
            thread_id: args.thread_id,
            old_category: "general",
            new_category: args.category,
            updated_at: new Date().toISOString()
        };
    }
}

export class ComposeDraftTool extends ToolDefinition {
    name = "compose_draft";
    description = "Provides all of the gathered context to another LLM to cleanly write a response";
    args = z.object({
        context: z.string().describe("The gathered context for composing the draft"),
        tone: z.enum(["professional", "friendly", "empathetic", "technical"]).optional().default("professional"),
        customer_name: z.string().optional().describe("Customer name for personalization")
    });
    result = z.object({
        draft: z.string(),
        confidence_score: z.number(),
        suggestions: z.array(z.string())
    });

    async execute(args: z.infer<typeof this.args>) {
        // Mock implementation
        const customerGreeting = args.customer_name ? `Hi ${args.customer_name},` : "Hi there,";
        return {
            draft: `${customerGreeting}

Thank you for reaching out to us. I understand you're experiencing some difficulties, and I'm here to help.

Based on your description, I've found some relevant information that should resolve your issue. Please follow these steps:

1. [Step 1 based on context]
2. [Step 2 based on context]
3. [Step 3 based on context]

If you continue to experience issues after following these steps, please don't hesitate to reach out again.

Best regards,
Support Team`,
            confidence_score: 0.85,
            suggestions: [
                "Consider adding more specific troubleshooting steps",
                "Include relevant knowledge base article links",
                "Add estimated resolution time"
            ]
        };
    }
}

export class UserActionNeededTool extends ToolDefinition {
    name = "user_action_needed";
    description = "Flag that human intervention is required for this thread";
    args = z.object({
        thread_id: z.string().describe("The thread ID that needs human attention"),
        reason: z.string().describe("Reason why human action is needed"),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        suggested_actions: z.array(z.string()).optional().describe("Suggested actions for the human")
    });
    result = z.object({
        thread_id: z.string(),
        flagged_at: z.string(),
        reason: z.string(),
        priority: z.string(),
        status: z.string()
    });

    async execute(args: z.infer<typeof this.args>) {
        // Mock implementation
        return {
            thread_id: args.thread_id,
            flagged_at: new Date().toISOString(),
            reason: args.reason,
            priority: args.priority,
            status: "flagged_for_human_review"
        };
    }
}

export class FinalizeDraftTool extends ToolDefinition {
    name = "finalize_draft";
    description = "Finalize and prepare the draft response for sending";
    args = z.object({
        thread_id: z.string().describe("The thread ID"),
        draft: z.string().describe("The draft response to finalize"),
        include_signature: z.boolean().optional().default(true)
    });
    result = z.object({
        thread_id: z.string(),
        final_draft: z.string(),
        ready_to_send: z.boolean(),
        finalized_at: z.string()
    });

    async execute(args: z.infer<typeof this.args>) {
        // Mock implementation
        const signature = args.include_signature ? "\n\nBest regards,\nProResponse AI Support Team" : "";
        return {
            thread_id: args.thread_id,
            final_draft: args.draft + signature,
            ready_to_send: true,
            finalized_at: new Date().toISOString()
        };
    }
}

// Export all tool classes for easy registration
export const ALL_MOCK_TOOLS = {
    SearchKnowledgeBaseTool,
    ReadKnowledgeBaseTool,
    SummarizeUsefulContextTool,
    UpdateThreadUrgencyTool,
    UpdateThreadCategoryTool,
    ComposeDraftTool,
    UserActionNeededTool,
    FinalizeDraftTool
};