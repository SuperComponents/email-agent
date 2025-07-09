import { Event } from "../types";
import { EvalTest } from "../eval_framework/runner";
import { ToolDefinition } from "../context/tools";
import {
  SearchKnowledgeBaseTool,
  ReadKnowledgeBaseTool,
  SummarizeUsefulContextTool,
  UpdateThreadUrgencyTool,
  UpdateThreadCategoryTool,
  ComposeDraftTool,
  UserActionNeededTool,
  FinalizeDraftTool
} from "../mocktools";

// Create instances of the mock tools
const mockTools: ToolDefinition[] = [
  new SearchKnowledgeBaseTool(),
  new ReadKnowledgeBaseTool(),
  new SummarizeUsefulContextTool(),
  new UpdateThreadUrgencyTool(),
  new UpdateThreadCategoryTool(),
  new ComposeDraftTool(),
  new UserActionNeededTool(),
  new FinalizeDraftTool()
];

// Feature Request Scenario: Customer suggests new functionality
const featureRequestEvents: Event[] = [
  // Event 1: Customer submits feature request
  {
    id: "evt_001",
    timestamp: new Date("2024-01-15T14:00:00Z"),
    type: "thread_started",
    actor: "customer",
    data: {
      threadId: "thread_789",
      from: "mike.developer@startup.com",
      subject: "Feature Request: API Rate Limiting Dashboard",
      body: "Hi team, I would love to see a dashboard that shows our API rate limiting status in real-time. Currently, we have to make separate API calls to check our limits, which is inefficient. A visual dashboard showing current usage, limits, and historical trends would be incredibly valuable for our development team. This would help us optimize our API usage and avoid hitting limits unexpectedly. Is this something you could consider adding?"
    }
  },
  
  // Event 2: System processes initial email
  {
    id: "evt_002",
    timestamp: new Date("2024-01-15T14:01:00Z"),
    type: "email_processed",
    actor: "system",
    data: {
      threadId: "thread_789",
      keywords: ["feature", "request", "dashboard", "API", "rate limiting", "usage", "development"],
      sentiment: "positive",
      urgency: "low"
    }
  },

  // Event 3: Customer provides more details about use case
  {
    id: "evt_003",
    timestamp: new Date("2024-01-15T14:30:00Z"),
    type: "reply_received",
    actor: "customer",
    data: {
      threadId: "thread_789",
      body: "To add more context, our team makes about 10,000 API calls per day across multiple services. We've hit rate limits twice this month, which caused service disruptions. A dashboard with alerts when we reach 80% of our limits would prevent these issues. We'd also like to see usage patterns by service endpoint to optimize our implementation."
    }
  },

  // Event 4: Customer mentions willingness to pay
  {
    id: "evt_004",
    timestamp: new Date("2024-01-15T15:00:00Z"),
    type: "reply_received",
    actor: "customer",
    data: {
      threadId: "thread_789",
      body: "I should mention that we'd be happy to pay for this as a premium feature if needed. Our team would find significant value in this functionality. Do you have any timeline for when new features like this might be considered? We're planning our development roadmap and would love to know if we should build our own solution or wait for this feature."
    }
  }
];

// Test cases for feature request scenario
export const featureRequestEvalTests: EvalTest[] = [
  // Test 1: Initial feature request - should search knowledge base for similar requests
  {
    name: "Initial feature request - search knowledge base",
    events: [featureRequestEvents[0], featureRequestEvents[1]],
    tools: mockTools,
    expectedToolCall: {
      name: "search_knowledge_base",
      args: {
        query: "feature request API rate limiting dashboard",
        limit: 5
      }
    }
  },

  // Test 2: After knowledge base search - should categorize as feature request
  {
    name: "After knowledge base search - categorize as feature request",
    events: [
      ...featureRequestEvents.slice(0, 2),
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T14:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: { query: "feature request API rate limiting dashboard", limit: 5 },
          output: {
            results: [
              { title: "Feature Request Process", content: "How to submit and track feature requests", relevance: 0.85 },
              { title: "API Documentation", content: "Current API features and limitations", relevance: 0.70 }
            ]
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_category",
      args: {
        thread_id: "thread_789",
        category: "feature_request"
      }
    }
  },

  // Test 3: After categorization - should set urgency to low
  {
    name: "After categorization - set urgency to low",
    events: [
      ...featureRequestEvents.slice(0, 2),
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T14:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: { query: "feature request API rate limiting dashboard", limit: 5 },
          output: {
            results: [
              { title: "Feature Request Process", content: "How to submit and track feature requests", relevance: 0.85 }
            ]
          }
        }
      },
      {
        id: "evt_tool_002",
        timestamp: new Date("2024-01-15T14:03:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_category",
          input: { thread_id: "thread_789", category: "feature_request" },
          output: { success: true }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_urgency",
      args: {
        thread_id: "thread_789",
        urgency: "low"
      }
    }
  },

  // Test 4: After customer provides use case details - should read feature request knowledge base
  {
    name: "Customer provides use case details - read feature request knowledge base",
    events: [
      ...featureRequestEvents.slice(0, 3),
      {
        id: "evt_tool_003",
        timestamp: new Date("2024-01-15T14:04:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_urgency",
          input: { thread_id: "thread_789", urgency: "low" },
          output: { success: true }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "read_knowledge_base",
      args: {
        id: "kb-002"
      }
    }
  },

  // Test 5: After customer mentions willingness to pay - should summarize context
  {
    name: "Customer mentions willingness to pay - summarize context",
    events: [
      ...featureRequestEvents.slice(0, 4),
      {
        id: "evt_tool_004",
        timestamp: new Date("2024-01-15T14:31:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "read_knowledge_base",
          input: { id: "kb-002" },
          output: {
            content: "Feature requests are collected and reviewed by the product team quarterly. Requests with strong business cases are prioritized for development."
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "summarize_useful_context",
      args: {
        events: [],
        focus: "feature_request"
      }
    }
  },

  // Test 6: After context summary - should compose acknowledgment response
  {
    name: "After context summary - compose acknowledgment response",
    events: [
      ...featureRequestEvents,
      {
        id: "evt_tool_005",
        timestamp: new Date("2024-01-15T15:01:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "summarize_useful_context",
          input: { events: [], focus: "feature_request" },
          output: {
            summary: "Customer requesting API rate limiting dashboard with real-time usage monitoring. Strong business case with 10,000 daily API calls. Willing to pay for premium feature.",
            keyPoints: ["API rate limiting dashboard", "Real-time usage monitoring", "Business case with usage data", "Premium feature interest"]
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "compose_draft",
      args: {
        context: "Customer requesting API rate limiting dashboard feature. Strong business case with 10,000 daily API calls. Willing to pay for premium feature.",
        tone: "professional",
        customer_name: "Mike"
      }
    }
  },

  // Test 7: Final draft completion with product team referral
  {
    name: "Final draft completion with product team referral",
    events: [
      ...featureRequestEvents,
      {
        id: "evt_tool_006",
        timestamp: new Date("2024-01-15T15:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "compose_draft",
          input: {
            context: "Customer requesting API rate limiting dashboard feature. Strong business case with 10,000 daily API calls. Willing to pay for premium feature.",
            tone: "professional",
            customer_name: "Mike"
          },
          output: {
            draft: "Dear Mike, Thank you for your detailed feature request for an API rate limiting dashboard. Your use case with 10,000 daily API calls and the challenges you've described provide excellent context for our product team. I've forwarded your request to our product team for review during their quarterly feature planning session. We'll keep you updated on the status and any timeline updates. In the meantime, I recommend implementing monitoring alerts at 80% usage as a temporary solution.",
            confidence: 0.90
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "finalize_draft",
      args: {
        thread_id: "thread_789",
        draft: "Dear Mike, Thank you for your detailed feature request for an API rate limiting dashboard. Your use case with 10,000 daily API calls and the challenges you've described provide excellent context for our product team. I've forwarded your request to our product team for review during their quarterly feature planning session. We'll keep you updated on the status and any timeline updates. In the meantime, I recommend implementing monitoring alerts at 80% usage as a temporary solution.",
        include_signature: true
      }
    }
  }
];

// Export for use in test runner
export default featureRequestEvalTests;