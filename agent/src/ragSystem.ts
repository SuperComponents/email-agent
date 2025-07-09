// RAG (Retrieval-Augmented Generation) System Integration
// Now integrated with actual OpenAI vector store via fileSearchTool

import { RAGQuery, RAGResult } from './types';
import { knowledgeBaseSearchTool } from './openaiClient';
import { run, Agent } from '@openai/agents';

/**
 * Query the company knowledge base for relevant information
 * Now uses actual OpenAI vector store via fileSearchTool
 * 
 * @param query - The search query to find relevant company information
 * @returns Promise<RAGResult[]> - Array of relevant knowledge base results
 */
export async function queryCompanyKnowledge(query: RAGQuery): Promise<RAGResult[]> {
  console.log(`[RAG-System] Querying knowledge base with query: "${query.query}"`);
  console.log(`[RAG-System] Category filter: ${query.category || 'all'}`);
  console.log(`[RAG-System] Max results: ${query.maxResults || 5}`);
  
  try {
    // Create a temporary agent with the knowledge base search tool to perform the query
    const searchAgent = new Agent({
      name: 'knowledge-search-agent',
      instructions: `You are a knowledge search agent. Search for relevant information about: "${query.query}"
      
      Focus on finding information related to: ${query.category || 'all categories'}
      
      Return the most relevant information found in the knowledge base. Be specific and detailed.`,
      model: 'gpt-4o-mini',
      tools: [knowledgeBaseSearchTool]
    });

    console.log(`[RAG-System] Executing search with vector store...`);
    
    const searchResult = await run(searchAgent, `Search for information about: ${query.query}`);
    const searchResponse = Array.isArray(searchResult?.output) 
      ? searchResult.output.map((item: any) => {
          // Look for assistant message with output_text content
          if (item.type === 'message' && item.role === 'assistant' && item.content) {
            if (Array.isArray(item.content)) {
              return item.content
                .filter((contentItem: any) => contentItem.type === 'output_text' && contentItem.text)
                .map((contentItem: any) => contentItem.text)
                .join('\n');
            }
          }
          return '';
        }).filter(text => text.length > 0).join('\n')
      : '';
    
    console.log(`[RAG-System] Vector store search completed`);
    console.log(`[RAG-System] Search response length: ${searchResponse.length} characters`);
    
    if (searchResponse.length > 10) {
      console.log(`[RAG-System] ✅ SUCCESS! Found content: "${searchResponse.substring(0, 200)}..."`);
    }
    
    // Parse the search response into RAGResult format
    const ragResults: RAGResult[] = parseSearchResponseToRAGResults(searchResponse, query);
    
    console.log(`[RAG-System] Parsed ${ragResults.length} results from search response`);
    
    return ragResults;
    
  } catch (error) {
    console.error(`[RAG-System] Error querying vector store:`, error);
    
    // Fallback to indicate search failed
    return [{
      id: 'search-error',
      title: 'Knowledge Base Search Error',
      content: `Unable to search knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`,
      category: 'other',
      relevanceScore: 0.1,
      lastUpdated: new Date(),
      source: 'error',
      metadata: { error: true }
    }];
  }
}

/**
 * Parse search response from vector store into RAGResult format
 * 
 * @param searchResponse - Response from the vector store search
 * @param query - Original query for context
 * @returns RAGResult[] - Parsed results
 */
function parseSearchResponseToRAGResults(searchResponse: string, query: RAGQuery): RAGResult[] {
  console.log(`[RAG-System] Parsing search response into RAGResult format`);
  
  // For now, create a single result with the search response
  // This could be enhanced to parse multiple results if the response contains structured data
  const result: RAGResult = {
    id: `search-${Date.now()}`,
    title: `Knowledge Base Search Results for "${query.query}"`,
    content: searchResponse,
    category: (query.category === 'all' ? 'other' : query.category) || 'knowledge',
    relevanceScore: 0.8, // Default relevance score
    lastUpdated: new Date(),
    source: 'vector-store',
    metadata: {
      originalQuery: query.query,
      searchCategory: query.category,
      searchTimestamp: new Date().toISOString()
    }
  };
  
  console.log(`[RAG-System] Created RAGResult with ID: ${result.id}`);
  
  return [result];
}

/**
 * Query company policies specifically
 * Enhanced to use actual vector store with policy-focused queries
 * 
 * @param policyQuery - Search query for policy information
 * @param policyType - Specific type of policy (optional)
 * @returns Promise<RAGResult[]> - Policy-related results
 */
export async function queryCompanyPolicies(
  policyQuery: string, 
  policyType?: 'refund' | 'privacy' | 'terms' | 'shipping' | 'support'
): Promise<RAGResult[]> {
  console.log(`[RAG-System] Querying company policies for: "${policyQuery}"`);
  console.log(`[RAG-System] Policy type filter: ${policyType || 'all'}`);
  
  // Enhance query with policy-specific context
  const enhancedQuery = `${policyQuery} ${policyType ? `${policyType} policy` : 'policy'}`;
  
  const ragQuery: RAGQuery = {
    query: enhancedQuery,
    category: 'policy',
    maxResults: 3,
    relevanceThreshold: 0.7,
    includeMetadata: true
  };
  
  console.log(`[RAG-System] Enhanced policy query: "${enhancedQuery}"`);
  
  const results = await queryCompanyKnowledge(ragQuery);
  
  console.log(`[RAG-System] Policy query completed: ${results.length} policy documents found`);
  
  return results;
}

/**
 * Query procedural knowledge (how-to guides, troubleshooting steps)
 * Enhanced to use actual vector store with procedure-focused queries
 * 
 * @param procedureQuery - Search query for procedural information  
 * @param issueType - Type of issue/procedure (optional)
 * @returns Promise<RAGResult[]> - Procedure-related results
 */
export async function queryProcedures(
  procedureQuery: string,
  issueType?: 'technical' | 'billing' | 'shipping' | 'account' | 'general'
): Promise<RAGResult[]> {
  console.log(`[RAG-System] Querying procedures for: "${procedureQuery}"`);
  console.log(`[RAG-System] Issue type: ${issueType || 'general'}`);
  
  // Enhance query with procedure-specific context
  const enhancedQuery = `${procedureQuery} ${issueType ? `${issueType} issue` : ''} procedure how-to steps`;
  
  const ragQuery: RAGQuery = {
    query: enhancedQuery,
    category: 'procedure',
    maxResults: 5,
    relevanceThreshold: 0.6,
    includeMetadata: true
  };
  
  console.log(`[RAG-System] Enhanced procedure query: "${enhancedQuery}"`);
  
  const results = await queryCompanyKnowledge(ragQuery);
  
  console.log(`[RAG-System] Procedure query completed: ${results.length} procedural guides found`);
  
  return results;
}

/**
 * Query frequently asked questions
 * Enhanced to use actual vector store with FAQ-focused queries
 * 
 * @param faqQuery - Search query for FAQ information
 * @returns Promise<RAGResult[]> - FAQ-related results
 */
export async function queryFAQ(faqQuery: string): Promise<RAGResult[]> {
  console.log(`[RAG-System] Querying FAQ for: "${faqQuery}"`);
  
  // Enhance query with FAQ-specific context
  const enhancedQuery = `${faqQuery} FAQ frequently asked questions`;
  
  const ragQuery: RAGQuery = {
    query: enhancedQuery,
    category: 'faq',
    maxResults: 3,
    relevanceThreshold: 0.8,
    includeMetadata: false
  };
  
  console.log(`[RAG-System] Enhanced FAQ query: "${enhancedQuery}"`);
  
  const results = await queryCompanyKnowledge(ragQuery);
  
  console.log(`[RAG-System] FAQ query completed: ${results.length} FAQ entries found`);
  
  return results;
}

/**
 * Generate contextual search queries based on email content
 * Enhanced to use actual vector store with intelligent query generation
 * 
 * @param emailContent - Raw email content to analyze
 * @param includeCategories - Categories to include in search
 * @returns Promise<RAGResult[]> - Combined results from multiple contextual queries
 */
export async function generateContextualQueries(
  emailContent: string,
  includeCategories: ('policy' | 'knowledge' | 'procedure' | 'faq')[] = ['policy', 'knowledge', 'procedure']
): Promise<RAGResult[]> {
  console.log(`[RAG-System] Generating contextual queries from email content`);
  console.log(`[RAG-System] Content length: ${emailContent.length} characters`);
  console.log(`[RAG-System] Categories to search: ${includeCategories.join(', ')}`);
  
  try {
    // Create a query analysis agent to generate relevant search queries
    const queryAgent = new Agent({
      name: 'query-analysis-agent',
      instructions: `You are a knowledge base query generator. Your job is to analyze email content and generate 2-3 specific search queries for finding relevant company information.

IMPORTANT: Format your response as a simple numbered list like this:
1. [first search query]
2. [second search query]  
3. [third search query]

Generate queries that would help find:
- Company policies (refund, billing, account, subscription policies)
- Troubleshooting procedures (technical issues, account problems)
- FAQ information (common questions and answers)
- General company knowledge

Categories to focus on: ${includeCategories.join(', ')}

Make each query specific and actionable - like you're searching a help center or knowledge base.`,
      model: 'gpt-4o-mini',
      tools: []
    });

    console.log(`[RAG-System] Analyzing email content to generate contextual queries...`);
    
    const analysisResult = await run(queryAgent, `Analyze this email content and generate relevant search queries:\n\n${emailContent}`);
    const analysisResponse = Array.isArray(analysisResult?.output) 
      ? analysisResult.output.map((item: any) => {
          // Look for assistant message with output_text content
          if (item.type === 'message' && item.role === 'assistant' && item.content) {
            if (Array.isArray(item.content)) {
              return item.content
                .filter((contentItem: any) => contentItem.type === 'output_text' && contentItem.text)
                .map((contentItem: any) => contentItem.text)
                .join('\n');
            }
          }
          return '';
        }).filter(text => text.length > 0).join('\n')
      : '';
    
    console.log(`[RAG-System] Query analysis completed`);
    console.log(`[RAG-System] Analysis response length: ${analysisResponse.length} characters`);
    
    // Extract queries from the analysis response
    let queries = extractQueriesFromAnalysis(analysisResponse);
    
    // If still no queries, create fallback queries from email keywords
    if (queries.length === 0) {
      console.log(`[RAG-System] Creating fallback queries from email keywords`);
      const keywords = extractKeywordsFromEmail(emailContent);
      if (keywords.length > 0) {
        queries = [
          `${keywords.slice(0, 2).join(' ')} policy`,
          `${keywords.slice(0, 2).join(' ')} troubleshooting`,
          `${keywords.slice(0, 2).join(' ')} help`
        ];
        console.log(`[RAG-System] Generated fallback queries:`, queries);
      }
    }
    
    console.log(`[RAG-System] Generated ${queries.length} contextual queries:`, queries);
    
    // Execute all queries in parallel
    const allResults: RAGResult[] = [];
    
    for (const query of queries.slice(0, 3)) { // Limit to top 3 for efficiency
      console.log(`[RAG-System] Executing contextual query: "${query}"`);
      
      const ragQuery: RAGQuery = {
        query,
        category: 'all',
        maxResults: 2,
        relevanceThreshold: 0.7
      };
      
      const results = await queryCompanyKnowledge(ragQuery);
      allResults.push(...results);
    }
    
    console.log(`[RAG-System] Contextual search completed: ${allResults.length} total results found`);
    
    return allResults;
    
  } catch (error) {
    console.error(`[RAG-System] Error in contextual query generation:`, error);
    
    // Fallback to simple keyword extraction
    console.log(`[RAG-System] Falling back to simple keyword extraction`);
    const keywords = extractKeywordsFromEmail(emailContent);
    
    if (keywords.length > 0) {
      const ragQuery: RAGQuery = {
        query: keywords.slice(0, 3).join(' '),
        category: 'all',
        maxResults: 3,
        relevanceThreshold: 0.6
      };
      
      return await queryCompanyKnowledge(ragQuery);
    }
    
    return [];
  }
}

/**
 * Extract search queries from analysis response
 * 
 * @param analysisResponse - Response from query analysis agent
 * @returns string[] - Extracted queries
 */
function extractQueriesFromAnalysis(analysisResponse: string): string[] {
  console.log(`[RAG-System] Extracting queries from analysis response`);
  console.log(`[RAG-System] Analysis response: "${analysisResponse}"`);
  
  const queries: string[] = [];
  const lines = analysisResponse.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Look for various query formats
    if (trimmed.toLowerCase().startsWith('query:') || 
        trimmed.toLowerCase().startsWith('search:') ||
        trimmed.match(/^\d+\.\s+/) || // Numbered lists
        trimmed.startsWith('- ')) { // Bullet points
      
      let query = trimmed;
      // Clean up the query
      query = query.replace(/^(query:|search:|\d+\.\s*|-\s*)/i, '').trim();
      
      if (query.length > 5) { // Only add substantial queries
        queries.push(query);
      }
    }
  }
  
  // If no structured queries found, try to extract from the raw response
  if (queries.length === 0) {
    console.log(`[RAG-System] No structured queries found, extracting from raw response`);
    
    // Split by common delimiters and extract meaningful phrases
    const phrases = analysisResponse
      .split(/[.!?;\n]/)
      .map(phrase => phrase.trim())
      .filter(phrase => phrase.length > 10 && phrase.length < 100)
      .slice(0, 3); // Take first 3 meaningful phrases
    
    queries.push(...phrases);
  }
  
  console.log(`[RAG-System] Extracted ${queries.length} queries from analysis:`, queries);
  
  return queries;
}

/**
 * Simple keyword extraction (fallback method)
 * 
 * @param emailContent - Email content to analyze
 * @returns string[] - Extracted keywords
 */
function extractKeywordsFromEmail(emailContent: string): string[] {
  console.log(`[RAG-System] Extracting keywords using simple pattern matching`);
  
  const commonSupportTerms = [
    'refund', 'billing', 'payment', 'subscription', 'premium', 'account',
    'login', 'password', 'access', 'features', 'bug', 'error', 'issue',
    'problem', 'help', 'support', 'cancel', 'upgrade', 'downgrade',
    'shipping', 'delivery', 'order', 'purchase', 'transaction'
  ];
  
  const content = emailContent.toLowerCase();
  const foundKeywords = commonSupportTerms.filter(term => content.includes(term));
  
  console.log(`[RAG-System] Found ${foundKeywords.length} relevant keywords in content`);
  
  return foundKeywords;
}

/**
 * Format RAG results for agent consumption
 * 
 * @param ragResults - Raw RAG results
 * @param maxContentLength - Maximum content length per result
 * @returns string - Formatted content for agent prompt
 */
export function formatRAGResultsForAgent(
  ragResults: RAGResult[],
  maxContentLength: number = 500
): string {
  console.log(`[RAG-System] Formatting ${ragResults.length} RAG results for agent consumption`);
  console.log(`[RAG-System] Max content length per result: ${maxContentLength} characters`);
  
  if (ragResults.length === 0) {
    console.log(`[RAG-System] No RAG results to format`);
    return 'No relevant company knowledge found for this query.';
  }
  
  const formattedSections: string[] = [];
  
  ragResults.forEach((result, index) => {
    console.log(`[RAG-System] Formatting result ${index + 1}: "${result.title}"`);
    
    // Truncate content if too long
    const content = result.content.length > maxContentLength 
      ? result.content.substring(0, maxContentLength) + '...'
      : result.content;
    
    const section = `
**${result.title}** (${result.category.toUpperCase()}) - Confidence: ${(result.relevanceScore * 100).toFixed(0)}%
${content}

Source: ${result.source}
Last Updated: ${result.lastUpdated.toLocaleDateString()}
${result.tags ? `Tags: ${result.tags.join(', ')}` : ''}
`.trim();

    formattedSections.push(section);
  });
  
  const formatted = `
## Relevant Company Knowledge (from Vector Store)

${formattedSections.join('\n\n---\n\n')}

**Note**: This information has been retrieved from our company knowledge base via vector store search. Please ensure the response aligns with these policies and procedures.
`.trim();
  
  console.log(`[RAG-System] Formatted content length: ${formatted.length} characters`);
  console.log(`[RAG-System] Number of sections: ${formattedSections.length}`);
  
  return formatted;
} 