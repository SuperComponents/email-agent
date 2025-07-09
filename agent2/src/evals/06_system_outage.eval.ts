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

// System Outage Scenario: Critical service disruption affecting multiple customers
const systemOutageEvents: Event[] = [
  // Event 1: Customer reports service unavailable
  {
    id: "evt_001",
    timestamp: new Date("2024-01-15T09:00:00Z"),
    type: "thread_started",
    actor: "customer",
    data: {
      threadId: "thread_999",
      from: "operations@bigcorp.com",
      subject: "URGENT: Service completely down",
      body: "Our entire team cannot access your service. We're getting 502 errors on all endpoints. This is affecting our production systems and we need immediate assistance. Our business is at a standstill. Please escalate this immediately!"
    }
  },
  
  // Event 2: System processes initial email
  {
    id: "evt_002",
    timestamp: new Date("2024-01-15T09:01:00Z"),
    type: "email_processed",
    actor: "system",
    data: {
      threadId: "thread_999",
      keywords: ["urgent", "service", "down", "502", "errors", "production", "immediate", "escalate"],
      sentiment: "urgent",
      urgency: "urgent"
    }
  },

  // Event 3: System detects multiple similar reports
  {
    id: "evt_003",
    timestamp: new Date("2024-01-15T09:02:00Z"),
    type: "system_alert",
    actor: "system",
    data: {
      threadId: "thread_999",
      alertType: "multiple_similar_reports",
      count: 25,
      timeframe: "5_minutes",
      pattern: "502_errors_service_unavailable"
    }
  },

  // Event 4: Customer provides more technical details
  {
    id: "evt_004",
    timestamp: new Date("2024-01-15T09:03:00Z"),
    type: "reply_received",
    actor: "customer",
    data: {
      threadId: "thread_999",
      body: "We're seeing 502 Bad Gateway errors from your API endpoints. The error started at approximately 8:58 AM EST. Our monitoring shows 100% failure rate across all API calls. This is a critical production issue affecting thousands of our customers. We need an ETA on resolution."
    }
  },

  // Event 5: System monitoring confirms widespread outage
  {
    id: "evt_005",
    timestamp: new Date("2024-01-15T09:04:00Z"),
    type: "system_alert",
    actor: "system",
    data: {
      threadId: "thread_999",
      alertType: "service_health_critical",
      affectedServices: ["api", "dashboard", "authentication"],
      errorRate: 0.98,
      duration: "6_minutes"
    }
  },

  // Event 6: Customer demands immediate escalation
  {
    id: "evt_006",
    timestamp: new Date("2024-01-15T09:05:00Z"),
    type: "reply_received",
    actor: "customer",
    data: {
      threadId: "thread_999",
      body: "This is now a 7-minute outage. We have SLA requirements and need immediate communication. Please escalate to your engineering team and provide a status page update. Our executives are asking for updates every 5 minutes."
    }
  }
];

// Test cases for system outage scenario
export const systemOutageEvalTests: EvalTest[] = [
  // Test 1: Initial outage report - should immediately update urgency to urgent
  {
    name: "Initial outage report - update urgency to urgent",
    events: [systemOutageEvents[0], systemOutageEvents[1]],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_urgency",
      args: {
        thread_id: "thread_999",
        urgency: "urgent"
      }
    }
  },

  // Test 2: After urgency update - should categorize as system outage
  {
    name: "After urgency update - categorize as system outage",
    events: [
      ...systemOutageEvents.slice(0, 2),
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T09:01:30Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_urgency",
          input: { thread_id: "thread_999", urgency: "urgent" },
          output: { success: true }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_category",
      args: {
        thread_id: "thread_999",
        category: "system_outage"
      }
    }
  },

  // Test 3: After multiple similar reports detected - should flag for immediate human action
  {
    name: "Multiple similar reports detected - flag for immediate human action",
    events: [
      ...systemOutageEvents.slice(0, 3),
      {
        id: "evt_tool_002",
        timestamp: new Date("2024-01-15T09:01:45Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_category",
          input: { thread_id: "thread_999", category: "system_outage" },
          output: { success: true }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "user_action_needed",
      args: {
        thread_id: "thread_999",
        reason: "Critical system outage with 502 errors affecting production systems. Multiple customers reporting similar issues (25 reports in 5 minutes).",
        priority: "urgent"
      }
    }
  },

  // Test 4: After customer provides technical details - should search knowledge base for outage procedures
  {
    name: "Customer provides technical details - search knowledge base for outage procedures",
    events: [
      ...systemOutageEvents.slice(0, 4),
      {
        id: "evt_tool_003",
        timestamp: new Date("2024-01-15T09:02:30Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "user_action_needed",
          input: {
            thread_id: "thread_999",
            reason: "Critical system outage with 502 errors affecting production systems. Multiple customers reporting similar issues (25 reports in 5 minutes).",
            priority: "urgent"
          },
          output: { success: true }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "search_knowledge_base",
      args: {
        query: "system outage 502 errors service unavailable crisis communication",
        limit: 5
      }
    }
  },

  // Test 5: After system monitoring confirms outage - should summarize critical context
  {
    name: "System monitoring confirms outage - summarize critical context",
    events: [
      ...systemOutageEvents.slice(0, 5),
      {
        id: "evt_tool_004",
        timestamp: new Date("2024-01-15T09:03:30Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: { query: "system outage 502 errors service unavailable crisis communication", limit: 5 },
          output: {
            results: [
              { title: "Critical Outage Response", content: "Emergency procedures for system-wide outages and customer communication", relevance: 0.95 },
              { title: "Status Page Updates", content: "How to communicate service disruptions to customers", relevance: 0.90 }
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
        focus: "critical_outage"
      }
    }
  },

  // Test 6: After customer demands escalation - should compose crisis communication
  {
    name: "Customer demands escalation - compose crisis communication",
    events: [
      ...systemOutageEvents.slice(0, 6),
      {
        id: "evt_tool_005",
        timestamp: new Date("2024-01-15T09:04:30Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "summarize_useful_context",
          input: { events: [], focus: "critical_outage" },
          output: {
            summary: "Critical system outage affecting API, dashboard, and authentication services. 98% error rate for 6 minutes. 25+ customers affected. Production systems down.",
            keyPoints: ["502 Bad Gateway errors", "6-minute duration", "Multiple services affected", "Production impact", "SLA requirements"]
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "compose_draft",
      args: {
        context: "Critical system outage with 502 errors affecting multiple services. 6-minute duration with 98% error rate. Customer has SLA requirements and needs immediate updates.",
        tone: "urgent",
        customer_name: "Operations Team"
      }
    }
  },

  // Test 7: Final crisis communication response
  {
    name: "Final crisis communication response",
    events: [
      ...systemOutageEvents,
      {
        id: "evt_tool_006",
        timestamp: new Date("2024-01-15T09:05:30Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "compose_draft",
          input: {
            context: "Critical system outage with 502 errors affecting multiple services. 6-minute duration with 98% error rate. Customer has SLA requirements and needs immediate updates.",
            tone: "urgent",
            customer_name: "Operations Team"
          },
          output: {
            draft: "URGENT UPDATE: We are experiencing a critical system outage affecting our API, dashboard, and authentication services as of 8:58 AM EST. Our engineering team has been immediately notified and is actively investigating. We understand the production impact to your systems and are treating this as our highest priority. Status updates will be provided every 5 minutes via our status page and direct communication. Our SLA team has been notified. Next update: 9:10 AM EST.",
            confidence: 0.98
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "finalize_draft",
      args: {
        thread_id: "thread_999",
        draft: "URGENT UPDATE: We are experiencing a critical system outage affecting our API, dashboard, and authentication services as of 8:58 AM EST. Our engineering team has been immediately notified and is actively investigating. We understand the production impact to your systems and are treating this as our highest priority. Status updates will be provided every 5 minutes via our status page and direct communication. Our SLA team has been notified. Next update: 9:10 AM EST.",
        include_signature: true
      }
    }
  },

  // Test 8: Single customer outage report - should still be urgent but different pattern
  {
    name: "Single customer outage report - urgent but individual",
    events: [
      {
        id: "evt_single_001",
        timestamp: new Date("2024-01-15T10:00:00Z"),
        type: "thread_started",
        actor: "customer",
        data: {
          threadId: "thread_998",
          from: "startup@smallco.com",
          subject: "Service appears to be down",
          body: "Hi, I'm unable to access your service. Getting timeout errors when trying to load the dashboard. Is there a known issue? This is affecting our daily operations."
        }
      },
      {
        id: "evt_single_002",
        timestamp: new Date("2024-01-15T10:01:00Z"),
        type: "email_processed",
        actor: "system",
        data: {
          threadId: "thread_998",
          keywords: ["service", "down", "timeout", "errors", "dashboard", "operations"],
          sentiment: "concerned",
          urgency: "high"
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_urgency",
      args: {
        thread_id: "thread_998",
        urgency: "high"
      }
    }
  }
];

// Export for use in test runner
export default systemOutageEvalTests;