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

// Login Issue Scenario: Multi-turn customer support interaction
const loginIssueEvents: Event[] = [
  // Event 1: Customer reports login issue
  {
    id: "evt_001",
    timestamp: new Date("2024-01-15T09:00:00Z"),
    type: "thread_started",
    actor: "customer",
    data: {
      threadId: "thread_123",
      from: "john.doe@company.com",
      subject: "Cannot log into my account",
      body: "Hi, I've been trying to log into my account for the past hour but keep getting an error message saying 'Invalid credentials'. I'm sure I'm using the correct email and password. This is urgent as I need to access my dashboard for an important meeting. Please help!"
    }
  },
  
  // Event 2: System processes initial email
  {
    id: "evt_002",
    timestamp: new Date("2024-01-15T09:01:00Z"),
    type: "email_processed",
    actor: "system",
    data: {
      threadId: "thread_123",
      keywords: ["login", "credentials", "error", "urgent", "dashboard"],
      sentiment: "frustrated",
      urgency: "high"
    }
  },

  // Event 3: Customer sends follow-up with more details
  {
    id: "evt_003",
    timestamp: new Date("2024-01-15T09:15:00Z"),
    type: "reply_received",
    actor: "customer",
    data: {
      threadId: "thread_123",
      body: "I forgot to mention - I tried resetting my password but I'm not receiving the reset email. I checked my spam folder too. The error I'm getting is exactly: 'Authentication failed. Please check your credentials and try again.'"
    }
  },

  // Event 4: Customer escalates urgency
  {
    id: "evt_004",
    timestamp: new Date("2024-01-15T09:30:00Z"),
    type: "reply_received",
    actor: "customer",
    data: {
      threadId: "thread_123",
      body: "This is becoming critical. My meeting is in 2 hours and I really need access to my account. Is there any way to get immediate help? I'm willing to verify my identity through other means."
    }
  },

  // Event 5: System detects pattern similar to outage
  {
    id: "evt_005",
    timestamp: new Date("2024-01-15T09:45:00Z"),
    type: "system_alert",
    actor: "system",
    data: {
      threadId: "thread_123",
      alertType: "similar_issues_detected",
      count: 5,
      timeframe: "30_minutes"
    }
  }
];

// Test cases for each stage of the login issue scenario
export const loginIssueEvalTests: EvalTest[] = [
  // Test 1: Initial response to login issue - should search knowledge base
  {
    name: "Initial login issue - search knowledge base",
    events: [loginIssueEvents[0], loginIssueEvents[1]],
    tools: mockTools,
    expectedToolCall: {
      name: "search_knowledge_base",
      args: {
        query: "login credentials error authentication failed",
        limit: 5
      }
    }
  },

  // Test 2: After knowledge base search - should update thread urgency 
  {
    name: "After knowledge base search - update thread urgency",
    events: [
      ...loginIssueEvents.slice(0, 2),
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T09:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: { query: "login credentials error authentication failed", category: "authentication" },
          output: {
            results: [
              { title: "Common Login Issues", content: "Password reset, account lockout, email verification", relevance: 0.9 },
              { title: "Authentication Troubleshooting", content: "Check credentials, clear cache, verify email", relevance: 0.8 }
            ]
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_urgency",
      args: {
        thread_id: "thread_123",
        urgency: "high"
      }
    }
  },

  // Test 3: After urgency update - should read specific knowledge base article
  {
    name: "After urgency update - read knowledge base article",
    events: [
      ...loginIssueEvents.slice(0, 2),
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T09:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: { query: "login credentials error authentication failed", category: "authentication" },
          output: {
            results: [
              { title: "Common Login Issues", content: "Password reset, account lockout, email verification", relevance: 0.9 },
              { title: "Authentication Troubleshooting", content: "Check credentials, clear cache, verify email", relevance: 0.8 }
            ]
          }
        }
      },
      {
        id: "evt_tool_002",
        timestamp: new Date("2024-01-15T09:03:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_urgency",
          input: { threadId: "thread_123", urgency: "high" },
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

  // Test 4: After customer provides more details - should search for password reset issues
  {
    name: "Customer provides more details - search password reset issues",
    events: [
      ...loginIssueEvents.slice(0, 4),
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T09:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: { query: "login credentials error authentication failed", category: "authentication" },
          output: {
            results: [
              { title: "Common Login Issues", content: "Password reset, account lockout, email verification", relevance: 0.9 }
            ]
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "search_knowledge_base",
      args: {
        query: "password reset email not received spam folder",
        limit: 5
      }
    }
  },

  // Test 5: After customer escalates - should summarize context for human
  {
    name: "Customer escalates - summarize context for human",
    events: [
      ...loginIssueEvents.slice(0, 5),
      {
        id: "evt_tool_003",
        timestamp: new Date("2024-01-15T09:16:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: { query: "password reset email not received spam folder", category: "password_reset" },
          output: {
            results: [
              { title: "Password Reset Email Issues", content: "Email delivery delays, spam filtering, domain blocks", relevance: 0.95 }
            ]
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "summarize_useful_context",
      args: {
        events: [],
        focus: "urgent_escalation"
      }
    }
  },

  // Test 6: After system detects similar issues - should update thread category
  {
    name: "System detects similar issues - update thread category",
    events: [
      ...loginIssueEvents,
      {
        id: "evt_tool_004",
        timestamp: new Date("2024-01-15T09:31:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "summarize_useful_context",
          input: { context: "Customer unable to login with authentication failed error. Password reset email not received. Multiple similar issues detected. Customer has urgent meeting in 2 hours.", focusArea: "urgent_escalation" },
          output: {
            summary: "Critical login issue with potential system-wide impact. Customer needs immediate assistance.",
            keyPoints: ["Authentication failure", "Password reset not working", "Multiple similar reports", "Time-sensitive customer need"]
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_category",
      args: {
        thread_id: "thread_123",
        category: "system_outage"
      }
    }
  },

  // Test 7: After categorization - should flag for user action
  {
    name: "After categorization - flag for user action",
    events: [
      ...loginIssueEvents,
      {
        id: "evt_tool_005",
        timestamp: new Date("2024-01-15T09:46:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_category",
          input: { threadId: "thread_123", category: "system_outage" },
          output: { success: true }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "user_action_needed",
      args: {
        thread_id: "thread_123",
        reason: "Multiple authentication failures detected. Possible system outage. Customer needs immediate manual verification.",
        priority: "urgent"
      }
    }
  },

  // Test 8: Compose draft with gathered context
  {
    name: "Compose draft with gathered context",
    events: [
      ...loginIssueEvents,
      {
        id: "evt_tool_006",
        timestamp: new Date("2024-01-15T09:47:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "user_action_needed",
          input: { threadId: "thread_123", actionType: "escalate_to_engineering", description: "Multiple authentication failures detected. Possible system outage. Customer needs immediate manual verification." },
          output: { success: true }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "compose_draft",
      args: {
        context: "Customer experiencing login issues with authentication failure. Password reset not working. Multiple similar issues detected indicating potential system outage. Customer has urgent business need.",
        tone: "empathetic",
        customer_name: "John"
      }
    }
  },

  // Test 9: Final draft completion
  {
    name: "Final draft completion",
    events: [
      ...loginIssueEvents,
      {
        id: "evt_tool_007",
        timestamp: new Date("2024-01-15T09:48:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "compose_draft",
          input: { context: "Customer experiencing login issues with authentication failure. Password reset not working. Multiple similar issues detected indicating potential system outage. Customer has urgent business need.", tone: "apologetic", includeWorkarounds: true },
          output: {
            draft: "Dear John, I sincerely apologize for the login issues you're experiencing. We've identified a potential system-wide authentication problem affecting multiple users. Our engineering team has been notified and is working on a fix. As an immediate workaround, I can manually verify your identity and temporarily reset your access. Please reply with your account details and I'll expedite this personally.",
            confidence: 0.9
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "finalize_draft",
      args: {
        thread_id: "thread_123",
        draft: "Dear John, I sincerely apologize for the login issues you're experiencing. We've identified a potential system-wide authentication problem affecting multiple users. Our engineering team has been notified and is working on a fix. As an immediate workaround, I can manually verify your identity and temporarily reset your access. Please reply with your account details and I'll expedite this personally.",
        include_signature: true
      }
    }
  }
];

// Export for use in test runner
export default loginIssueEvalTests;