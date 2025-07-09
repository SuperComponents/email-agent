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

// Login Issue Scenario following DefaultContextGeneratorV2 policy
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

  // Event 3: Customer provides more details
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
  }
];

// Test cases following DefaultContextGeneratorV2 policy
export const loginIssuePolicyEvalTests: EvalTest[] = [
  // Test 1: Initial login issue - should search knowledge base first
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

  // Test 2: After search - should read knowledge base article
  {
    name: "After search - read knowledge base article",
    events: [
      ...loginIssueEvents.slice(0, 2),
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T09:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: { query: "login credentials error authentication failed", limit: 5 },
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
      name: "read_knowledge_base",
      args: {
        id: "kb-002"
      }
    }
  },

  // Test 3: After read - must summarize useful context (policy requirement)
  {
    name: "After read KB - summarize useful context",
    events: [
      ...loginIssueEvents.slice(0, 2),
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T09:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: { query: "login credentials error authentication failed", limit: 5 },
          output: {
            results: [
              { title: "Common Login Issues", content: "Password reset, account lockout, email verification", relevance: 0.9 }
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
          tool: "read_knowledge_base",
          input: { id: "kb-002" },
          output: {
            content: "Login issues are often caused by incorrect credentials, browser cache, or email verification problems. First check password reset process."
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "summarize_useful_context",
      args: {
        events: [],
        focus: "login_troubleshooting"
      }
    }
  },

  // Test 4: After summarize - update urgency level (policy requirement)
  {
    name: "After summarize - update urgency level",
    events: [
      ...loginIssueEvents.slice(0, 2),
      {
        id: "evt_tool_003",
        timestamp: new Date("2024-01-15T09:04:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "summarize_useful_context",
          input: { events: [], focus: "login_troubleshooting" },
          output: {
            summary: "Customer experiencing login issues with invalid credentials error. Password reset not working. Urgent business need for access.",
            keyPoints: ["Authentication failure", "Password reset issues", "Time-sensitive customer need"]
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

  // Test 5: After urgency - update thread category (policy requirement)
  {
    name: "After urgency - update thread category",
    events: [
      ...loginIssueEvents.slice(0, 2),
      {
        id: "evt_tool_004",
        timestamp: new Date("2024-01-15T09:05:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_urgency",
          input: { thread_id: "thread_123", urgency: "high" },
          output: { success: true }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_category",
      args: {
        thread_id: "thread_123",
        category: "bug"
      }
    }
  },

  // Test 6: Customer provides more details - search knowledge base again
  {
    name: "Customer provides more details - search KB again",
    events: [
      ...loginIssueEvents.slice(0, 3),
      {
        id: "evt_tool_005",
        timestamp: new Date("2024-01-15T09:06:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_category",
          input: { thread_id: "thread_123", category: "bug" },
          output: { success: true }
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

  // Test 7: After second search - read knowledge base
  {
    name: "After second search - read knowledge base",
    events: [
      ...loginIssueEvents.slice(0, 3),
      {
        id: "evt_tool_006",
        timestamp: new Date("2024-01-15T09:16:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: { query: "password reset email not received spam folder", limit: 5 },
          output: {
            results: [
              { title: "Password Reset Issues", content: "Email delivery problems and troubleshooting", relevance: 0.95 }
            ]
          }
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

  // Test 8: After second read - summarize useful context
  {
    name: "After second read - summarize useful context",
    events: [
      ...loginIssueEvents.slice(0, 3),
      {
        id: "evt_tool_007",
        timestamp: new Date("2024-01-15T09:17:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "read_knowledge_base",
          input: { id: "kb-002" },
          output: {
            content: "Password reset emails may be delayed or blocked. Check spam folder, verify email address, and try alternative reset methods."
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "summarize_useful_context",
      args: {
        events: [],
        focus: "password_reset_issues"
      }
    }
  },

  // Test 9: Customer escalates - determine if user action needed or draft
  {
    name: "Customer escalates - needs user action (complex case)",
    events: [
      ...loginIssueEvents.slice(0, 4),
      {
        id: "evt_tool_008",
        timestamp: new Date("2024-01-15T09:31:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "summarize_useful_context",
          input: { events: [], focus: "password_reset_issues" },
          output: {
            summary: "Customer unable to login with authentication errors. Password reset emails not received. Multiple troubleshooting attempts failed. Time-sensitive business need.",
            keyPoints: ["Authentication failure", "Password reset not working", "Urgent business meeting", "Multiple failed attempts"]
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "user_action_needed",
      args: {
        thread_id: "thread_123",
        reason: "Complex login issue with failed password reset. Customer needs manual account verification due to time constraints.",
        priority: "high"
      }
    }
  },

  // Test 10: Alternative path - compose draft for simple case
  {
    name: "Simple case - compose draft when confident",
    events: [
      {
        id: "evt_simple_001",
        timestamp: new Date("2024-01-15T10:00:00Z"),
        type: "thread_started",
        actor: "customer",
        data: {
          threadId: "thread_124",
          from: "simple.user@company.com",
          subject: "Quick login question",
          body: "Hi, I can't remember my password. Can you help me reset it?"
        }
      },
      {
        id: "evt_simple_002",
        timestamp: new Date("2024-01-15T10:01:00Z"),
        type: "email_processed",
        actor: "system",
        data: {
          threadId: "thread_124",
          keywords: ["password", "reset", "help"],
          sentiment: "neutral",
          urgency: "low"
        }
      },
      // After knowledge base operations and context summary...
      {
        id: "evt_tool_simple",
        timestamp: new Date("2024-01-15T10:05:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "summarize_useful_context",
          input: { events: [], focus: "password_reset" },
          output: {
            summary: "Simple password reset request. Standard procedure available in knowledge base.",
            keyPoints: ["Password reset request", "Standard procedure", "Low complexity"]
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "compose_draft",
      args: {
        context: "Customer requesting password reset assistance. Standard procedure available.",
        tone: "helpful",
        customer_name: "Customer"
      }
    }
  },

  // Test 11: After compose draft - finalize draft
  {
    name: "After compose draft - finalize draft",
    events: [
      {
        id: "evt_draft_001",
        timestamp: new Date("2024-01-15T11:00:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "compose_draft",
          input: {
            context: "Customer requesting password reset assistance. Standard procedure available.",
            tone: "helpful",
            customer_name: "Customer"
          },
          output: {
            draft: "Hi! I'd be happy to help you reset your password. Please click the 'Forgot Password' link on our login page and follow the instructions. You should receive a reset email within 5 minutes. Let me know if you need any assistance!",
            confidence: 0.9
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "finalize_draft",
      args: {
        thread_id: "thread_124",
        draft: "Hi! I'd be happy to help you reset your password. Please click the 'Forgot Password' link on our login page and follow the instructions. You should receive a reset email within 5 minutes. Let me know if you need any assistance!",
        include_signature: true
      }
    }
  }
];

// Export for use in test runner
export default loginIssuePolicyEvalTests;