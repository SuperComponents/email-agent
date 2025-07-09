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

// Account Setup Scenario: New customer needs onboarding help
const accountSetupEvents: Event[] = [
  // Event 1: Customer reports setup difficulties
  {
    id: "evt_001",
    timestamp: new Date("2024-01-15T12:00:00Z"),
    type: "thread_started",
    actor: "customer",
    data: {
      threadId: "thread_555",
      from: "new.customer@business.com",
      subject: "Need help setting up my account",
      body: "Hi, I just signed up for your service and I'm having trouble with the initial setup. I followed the getting started guide but I'm stuck on the API key configuration step. The instructions mention generating an API key but I don't see that option in my dashboard. Could you please help me get this set up? I'm eager to start using your platform for my project."
    }
  },
  
  // Event 2: System processes initial email
  {
    id: "evt_002",
    timestamp: new Date("2024-01-15T12:01:00Z"),
    type: "email_processed",
    actor: "system",
    data: {
      threadId: "thread_555",
      keywords: ["setup", "account", "API key", "configuration", "dashboard", "getting started"],
      sentiment: "neutral",
      urgency: "medium"
    }
  },

  // Event 3: Customer provides more context about their account
  {
    id: "evt_003",
    timestamp: new Date("2024-01-15T12:15:00Z"),
    type: "reply_received",
    actor: "customer",
    data: {
      threadId: "thread_555",
      body: "I should mention that I signed up for the Business plan about 2 hours ago. I received the welcome email and confirmed my email address. When I log into my dashboard, I can see my account settings but the API section just shows 'Coming soon' instead of the key generation options mentioned in the documentation."
    }
  },

  // Event 4: Customer expresses frustration with delay
  {
    id: "evt_004",
    timestamp: new Date("2024-01-15T12:45:00Z"),
    type: "reply_received",
    actor: "customer",
    data: {
      threadId: "thread_555",
      body: "I'm getting a bit concerned because I have a demo scheduled with my team tomorrow and I really need to get this working. Is there something wrong with my account setup? I've double-checked all the steps in the guide and everything seems correct except for the missing API key section."
    }
  },

  // Event 5: Customer asks for manual intervention
  {
    id: "evt_005",
    timestamp: new Date("2024-01-15T13:00:00Z"),
    type: "reply_received",
    actor: "customer",
    data: {
      threadId: "thread_555",
      body: "Could someone from your team manually enable the API features for my account? I'm willing to verify my identity or provide any additional information needed. I just need to get this working for my demo tomorrow."
    }
  }
];

// Test cases for account setup scenario
export const accountSetupEvalTests: EvalTest[] = [
  // Test 1: Initial setup issue - should search knowledge base for setup guidance
  {
    name: "Initial setup issue - search knowledge base",
    events: [accountSetupEvents[0], accountSetupEvents[1]],
    tools: mockTools,
    expectedToolCall: {
      name: "search_knowledge_base",
      args: {
        query: "account setup API key configuration dashboard",
        limit: 5
      }
    }
  },

  // Test 2: After knowledge base search - should categorize as onboarding
  {
    name: "After knowledge base search - categorize as onboarding",
    events: [
      ...accountSetupEvents.slice(0, 2),
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T12:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: { query: "account setup API key configuration dashboard", limit: 5 },
          output: {
            results: [
              { title: "Account Setup Guide", content: "Step-by-step guide for new account setup and API key generation", relevance: 0.95 },
              { title: "API Key Management", content: "How to generate and manage API keys in your dashboard", relevance: 0.90 }
            ]
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_category",
      args: {
        thread_id: "thread_555",
        category: "onboarding"
      }
    }
  },

  // Test 3: After categorization - should set medium urgency
  {
    name: "After categorization - set medium urgency",
    events: [
      ...accountSetupEvents.slice(0, 2),
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T12:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: { query: "account setup API key configuration dashboard", limit: 5 },
          output: {
            results: [
              { title: "Account Setup Guide", content: "Step-by-step guide for new account setup and API key generation", relevance: 0.95 }
            ]
          }
        }
      },
      {
        id: "evt_tool_002",
        timestamp: new Date("2024-01-15T12:03:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_category",
          input: { thread_id: "thread_555", category: "onboarding" },
          output: { success: true }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_urgency",
      args: {
        thread_id: "thread_555",
        urgency: "medium"
      }
    }
  },

  // Test 4: After customer provides account context - should read setup knowledge base
  {
    name: "Customer provides account context - read setup knowledge base",
    events: [
      ...accountSetupEvents.slice(0, 3),
      {
        id: "evt_tool_003",
        timestamp: new Date("2024-01-15T12:04:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_urgency",
          input: { thread_id: "thread_555", urgency: "medium" },
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

  // Test 5: After customer expresses demo urgency - should update urgency to high
  {
    name: "Customer expresses demo urgency - update urgency to high",
    events: [
      ...accountSetupEvents.slice(0, 4),
      {
        id: "evt_tool_004",
        timestamp: new Date("2024-01-15T12:16:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "read_knowledge_base",
          input: { id: "kb-002" },
          output: {
            content: "New Business accounts require manual API key activation within 24 hours. Contact support if API section shows 'Coming soon' after email confirmation."
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_urgency",
      args: {
        thread_id: "thread_555",
        urgency: "high"
      }
    }
  },

  // Test 6: After customer requests manual intervention - should flag for user action
  {
    name: "Customer requests manual intervention - flag for user action",
    events: [
      ...accountSetupEvents.slice(0, 5),
      {
        id: "evt_tool_005",
        timestamp: new Date("2024-01-15T12:46:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_urgency",
          input: { thread_id: "thread_555", urgency: "high" },
          output: { success: true }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "user_action_needed",
      args: {
        thread_id: "thread_555",
        reason: "New Business account requires manual API key activation. Customer has demo scheduled for tomorrow.",
        priority: "high"
      }
    }
  },

  // Test 7: After user action flag - should summarize context for support team
  {
    name: "After user action flag - summarize context for support team",
    events: [
      ...accountSetupEvents,
      {
        id: "evt_tool_006",
        timestamp: new Date("2024-01-15T13:01:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "user_action_needed",
          input: {
            thread_id: "thread_555",
            reason: "New Business account requires manual API key activation. Customer has demo scheduled for tomorrow.",
            priority: "high"
          },
          output: { success: true }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "summarize_useful_context",
      args: {
        events: [],
        focus: "account_setup"
      }
    }
  },

  // Test 8: After context summary - should compose helpful response
  {
    name: "After context summary - compose helpful response",
    events: [
      ...accountSetupEvents,
      {
        id: "evt_tool_007",
        timestamp: new Date("2024-01-15T13:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "summarize_useful_context",
          input: { events: [], focus: "account_setup" },
          output: {
            summary: "New Business plan customer experiencing API key setup issues. Account needs manual activation. Customer has demo scheduled for tomorrow.",
            keyPoints: ["Business plan customer", "API key activation needed", "Demo scheduled tomorrow", "Manual intervention required"]
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "compose_draft",
      args: {
        context: "New Business plan customer experiencing API key setup issues. Account needs manual activation for demo tomorrow.",
        tone: "helpful",
        customer_name: "Customer"
      }
    }
  },

  // Test 9: Final response with activation timeline
  {
    name: "Final response with activation timeline",
    events: [
      ...accountSetupEvents,
      {
        id: "evt_tool_008",
        timestamp: new Date("2024-01-15T13:03:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "compose_draft",
          input: {
            context: "New Business plan customer experiencing API key setup issues. Account needs manual activation for demo tomorrow.",
            tone: "helpful",
            customer_name: "Customer"
          },
          output: {
            draft: "Thank you for reaching out! I can help you get your API keys set up. The 'Coming soon' message in your dashboard is normal for new Business accounts - we manually activate API access within 24 hours for security purposes. Since you have a demo tomorrow, I've expedited your account activation. Your API key section should be available within the next 2 hours. I'll send you a follow-up email once it's ready with the next steps for key generation.",
            confidence: 0.90
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "finalize_draft",
      args: {
        thread_id: "thread_555",
        draft: "Thank you for reaching out! I can help you get your API keys set up. The 'Coming soon' message in your dashboard is normal for new Business accounts - we manually activate API access within 24 hours for security purposes. Since you have a demo tomorrow, I've expedited your account activation. Your API key section should be available within the next 2 hours. I'll send you a follow-up email once it's ready with the next steps for key generation.",
        include_signature: true
      }
    }
  }
];

// Export for use in test runner
export default accountSetupEvalTests;