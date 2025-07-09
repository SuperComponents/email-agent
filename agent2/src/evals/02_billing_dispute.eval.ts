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

// Billing Dispute Scenario: Customer disputes a charge, requires escalation
const billingDisputeEvents: Event[] = [
  // Event 1: Customer reports billing dispute
  {
    id: "evt_001",
    timestamp: new Date("2024-01-15T10:00:00Z"),
    type: "thread_started",
    actor: "customer",
    data: {
      threadId: "thread_456",
      from: "sarah.jones@business.com",
      subject: "Disputed charge on my account",
      body: "I was charged $299 on January 10th for a premium plan that I never signed up for. I have been using the basic plan and never upgraded. This charge needs to be reversed immediately as it's affecting my business finances. Please investigate and refund this incorrect charge."
    }
  },
  
  // Event 2: System processes initial email
  {
    id: "evt_002",
    timestamp: new Date("2024-01-15T10:01:00Z"),
    type: "email_processed",
    actor: "system",
    data: {
      threadId: "thread_456",
      keywords: ["billing", "dispute", "charge", "refund", "premium", "never signed up"],
      sentiment: "frustrated",
      urgency: "high"
    }
  },

  // Event 3: Customer provides more transaction details
  {
    id: "evt_003",
    timestamp: new Date("2024-01-15T10:30:00Z"),
    type: "reply_received",
    actor: "customer",
    data: {
      threadId: "thread_456",
      body: "I just checked my account history and there's no record of me upgrading to premium. The charge appears as 'Premium Subscription - Jan 2024' on my credit card. Transaction ID: TXN-789123456. I need this resolved today as it's causing overdraft issues with my business account."
    }
  },

  // Event 4: Customer escalates with financial impact
  {
    id: "evt_004",
    timestamp: new Date("2024-01-15T11:00:00Z"),
    type: "reply_received",
    actor: "customer",
    data: {
      threadId: "thread_456",
      body: "This is urgent. The unauthorized charge has caused my business account to overdraft, resulting in additional fees. I need this resolved immediately and I expect compensation for the overdraft fees caused by your billing error. Please escalate this to your billing department."
    }
  }
];

// Test cases for billing dispute scenario
export const billingDisputeEvalTests: EvalTest[] = [
  // Test 1: Initial billing dispute - should search knowledge base for billing policies
  {
    name: "Initial billing dispute - search knowledge base",
    events: [billingDisputeEvents[0], billingDisputeEvents[1]],
    tools: mockTools,
    expectedToolCall: {
      name: "search_knowledge_base",
      args: {
        query: "billing dispute charge refund premium subscription",
        limit: 5
      }
    }
  },

  // Test 2: After knowledge base search - should update thread urgency to high
  {
    name: "After knowledge base search - update thread urgency to high",
    events: [
      ...billingDisputeEvents.slice(0, 2),
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T10:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: { query: "billing dispute charge refund premium subscription", limit: 5 },
          output: {
            results: [
              { title: "Billing Dispute Process", content: "Steps to handle billing disputes and refund requests", relevance: 0.95 },
              { title: "Subscription Management", content: "How to verify subscription changes and billing history", relevance: 0.85 }
            ]
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_urgency",
      args: {
        thread_id: "thread_456",
        urgency: "high"
      }
    }
  },

  // Test 3: After urgency update - should read billing dispute knowledge base article
  {
    name: "After urgency update - read billing dispute article",
    events: [
      ...billingDisputeEvents.slice(0, 2),
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T10:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: { query: "billing dispute charge refund premium subscription", limit: 5 },
          output: {
            results: [
              { title: "Billing Dispute Process", content: "Steps to handle billing disputes and refund requests", relevance: 0.95 }
            ]
          }
        }
      },
      {
        id: "evt_tool_002",
        timestamp: new Date("2024-01-15T10:03:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_urgency",
          input: { thread_id: "thread_456", urgency: "high" },
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

  // Test 4: After customer provides transaction details - should categorize as billing
  {
    name: "Customer provides transaction details - categorize as billing",
    events: [
      ...billingDisputeEvents.slice(0, 3),
      {
        id: "evt_tool_003",
        timestamp: new Date("2024-01-15T10:04:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "read_knowledge_base",
          input: { id: "kb-002" },
          output: {
            content: "Billing disputes require manual review. Verify transaction history and subscription changes. Escalate to billing team for refund processing."
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_category",
      args: {
        thread_id: "thread_456",
        category: "billing"
      }
    }
  },

  // Test 5: After customer escalates with financial impact - should flag for human action
  {
    name: "Customer escalates with financial impact - flag for human action",
    events: [
      ...billingDisputeEvents.slice(0, 4),
      {
        id: "evt_tool_004",
        timestamp: new Date("2024-01-15T10:31:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_category",
          input: { thread_id: "thread_456", category: "billing" },
          output: { success: true }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "user_action_needed",
      args: {
        thread_id: "thread_456",
        reason: "Billing dispute with unauthorized charge causing overdraft fees. Requires manual review and refund processing.",
        priority: "urgent"
      }
    }
  },

  // Test 6: After human action flag - should summarize context for billing team
  {
    name: "After human action flag - summarize context for billing team",
    events: [
      ...billingDisputeEvents,
      {
        id: "evt_tool_005",
        timestamp: new Date("2024-01-15T11:01:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "user_action_needed",
          input: { 
            thread_id: "thread_456", 
            reason: "Billing dispute with unauthorized charge causing overdraft fees. Requires manual review and refund processing.",
            priority: "urgent"
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
        focus: "billing_dispute"
      }
    }
  },

  // Test 7: After context summary - should compose empathetic response
  {
    name: "After context summary - compose empathetic response",
    events: [
      ...billingDisputeEvents,
      {
        id: "evt_tool_006",
        timestamp: new Date("2024-01-15T11:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "summarize_useful_context",
          input: { events: [], focus: "billing_dispute" },
          output: {
            summary: "Customer disputing unauthorized $299 premium charge. Transaction ID: TXN-789123456. Causing overdraft fees. Requires immediate refund and compensation review.",
            keyPoints: ["Unauthorized premium charge", "Financial impact with overdraft", "Transaction details provided", "Immediate resolution needed"]
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "compose_draft",
      args: {
        context: "Customer disputing unauthorized $299 premium charge causing overdraft fees. Transaction ID provided. Requires immediate billing team review and refund processing.",
        tone: "empathetic",
        customer_name: "Sarah"
      }
    }
  },

  // Test 8: Final draft completion
  {
    name: "Final draft completion",
    events: [
      ...billingDisputeEvents,
      {
        id: "evt_tool_007",
        timestamp: new Date("2024-01-15T11:03:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "compose_draft",
          input: {
            context: "Customer disputing unauthorized $299 premium charge causing overdraft fees. Transaction ID provided. Requires immediate billing team review and refund processing.",
            tone: "empathetic",
            customer_name: "Sarah"
          },
          output: {
            draft: "Dear Sarah, I sincerely apologize for the unauthorized charge on your account. I understand this has caused significant financial stress with overdraft fees. I've escalated this to our billing team for immediate review of transaction TXN-789123456. We will process a full refund within 2 business days and review compensation for the overdraft fees caused by our error. You'll receive a follow-up within 4 hours with next steps.",
            confidence: 0.95
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "finalize_draft",
      args: {
        thread_id: "thread_456",
        draft: "Dear Sarah, I sincerely apologize for the unauthorized charge on your account. I understand this has caused significant financial stress with overdraft fees. I've escalated this to our billing team for immediate review of transaction TXN-789123456. We will process a full refund within 2 business days and review compensation for the overdraft fees caused by our error. You'll receive a follow-up within 4 hours with next steps.",
        include_signature: true
      }
    }
  }
];

// Export for use in test runner
export default billingDisputeEvalTests;