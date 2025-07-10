import { Event } from "../types";
import { EvalTest } from "../eval_framework/runner";
import { ToolDefinition } from "../context/tools";
import {
  SearchKnowledgeBaseTool,
  ReadKnowledgeBaseTool,
  SummarizeUsefulContextTool,
  UpdateThreadUrgencyTool,
  UpdateThreadCategoryTool,
  ComposeDraftToolMock,
  UserActionNeededTool,
  FinalizeDraftTool,
} from "../mocktools";

// Create instances of the mock tools
const mockTools: ToolDefinition[] = [
  new SearchKnowledgeBaseTool(),
  new ReadKnowledgeBaseTool(),
  new SummarizeUsefulContextTool(),
  new UpdateThreadUrgencyTool(),
  new UpdateThreadCategoryTool(),
  new ComposeDraftToolMock(),
  new UserActionNeededTool(),
  new FinalizeDraftTool(),
];

// Positive Feedback Scenario following DefaultContextGeneratorV2 policy
const positiveFeedbackEvents: Event[] = [
  // Event 1: Customer sends thank you message
  {
    id: "evt_001",
    timestamp: new Date("2024-01-15T16:00:00Z"),
    type: "thread_started",
    actor: "customer",
    data: {
      threadId: "thread_321",
      from: "anna.customer@company.com",
      subject: "Thank you for the excellent support!",
      body: "Hi team, I just wanted to reach out and thank you for the amazing support I received yesterday. Lisa was incredibly helpful in resolving my integration issue and went above and beyond to ensure everything was working perfectly. The response time was fantastic and the solution was exactly what I needed. Keep up the great work!",
    },
  },

  // Event 2: System processes initial email
  {
    id: "evt_002",
    timestamp: new Date("2024-01-15T16:01:00Z"),
    type: "email_processed",
    actor: "system",
    data: {
      threadId: "thread_321",
      keywords: [
        "thank you",
        "excellent",
        "support",
        "amazing",
        "helpful",
        "great work",
      ],
      sentiment: "positive",
      urgency: "low",
    },
  },
];

// Test cases following DefaultContextGeneratorV2 policy for positive feedback
export const positiveFeedbackPolicyEvalTests: EvalTest[] = [
  // Test 1: Positive feedback - search knowledge base first (policy requirement)
  {
    name: "Positive feedback - search knowledge base for response templates",
    events: [positiveFeedbackEvents[0], positiveFeedbackEvents[1]],
    tools: mockTools,
    expectedToolCall: {
      name: "search_knowledge_base",
      args: {
        query: "positive feedback thank you response templates",
        limit: 5,
      },
    },
  },

  // Test 2: After search - read knowledge base (policy requirement)
  {
    name: "After search - read knowledge base article",
    events: [
      ...positiveFeedbackEvents,
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T16:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: {
            query: "positive feedback thank you response templates",
            limit: 5,
          },
          output: {
            results: [
              {
                title: "Positive Feedback Responses",
                content:
                  "How to respond to customer appreciation and testimonials",
                relevance: 0.95,
              },
              {
                title: "Customer Success Stories",
                content: "Guidelines for handling positive customer feedback",
                relevance: 0.85,
              },
            ],
          },
        },
      },
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "read_knowledge_base",
      args: {
        id: "kb-002",
      },
    },
  },

  // Test 3: After read - summarize useful context (policy requirement)
  {
    name: "After read - summarize useful context",
    events: [
      ...positiveFeedbackEvents,
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T16:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "search_knowledge_base",
          input: {
            query: "positive feedback thank you response templates",
            limit: 5,
          },
          output: {
            results: [
              {
                title: "Positive Feedback Responses",
                content:
                  "How to respond to customer appreciation and testimonials",
                relevance: 0.95,
              },
            ],
          },
        },
      },
      {
        id: "evt_tool_002",
        timestamp: new Date("2024-01-15T16:03:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "read_knowledge_base",
          input: { id: "kb-002" },
          output: {
            content:
              "When responding to positive feedback, acknowledge the specific team member mentioned, express gratitude, and encourage future communication. Keep responses warm but professional.",
          },
        },
      },
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "summarize_useful_context",
      args: {
        events: [],
        focus: "positive_feedback_response",
      },
    },
  },

  // Test 4: After summarize - update urgency (policy requirement)
  {
    name: "After summarize - update urgency to low",
    events: [
      ...positiveFeedbackEvents,
      {
        id: "evt_tool_003",
        timestamp: new Date("2024-01-15T16:04:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "summarize_useful_context",
          input: { events: [], focus: "positive_feedback_response" },
          output: {
            summary:
              "Customer expressing gratitude for excellent support from Lisa. Positive feedback about integration issue resolution and response time.",
            keyPoints: [
              "Positive feedback",
              "Team member Lisa praised",
              "Integration issue resolved",
              "Response time appreciated",
            ],
          },
        },
      },
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_urgency",
      args: {
        thread_id: "thread_321",
        urgency: "low",
      },
    },
  },

  // Test 5: After urgency - update category (policy requirement)
  {
    name: "After urgency - update thread category",
    events: [
      ...positiveFeedbackEvents,
      {
        id: "evt_tool_004",
        timestamp: new Date("2024-01-15T16:05:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_urgency",
          input: { thread_id: "thread_321", urgency: "low" },
          output: { success: true },
        },
      },
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_category",
      args: {
        thread_id: "thread_321",
        category: "feedback",
      },
    },
  },

  // Test 6: After category - compose draft (confident response)
  {
    name: "After category - compose draft response",
    events: [
      ...positiveFeedbackEvents,
      {
        id: "evt_tool_005",
        timestamp: new Date("2024-01-15T16:06:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_category",
          input: { thread_id: "thread_321", category: "feedback" },
          output: { success: true },
        },
      },
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "compose_draft",
      args: {
        context:
          "Customer expressing gratitude for excellent support from Lisa regarding integration issue resolution.",
        tone: "professional",
        customer_name: "Anna",
      },
    },
  },

  // Test 7: After compose - finalize draft (policy requirement)
  {
    name: "After compose - finalize draft",
    events: [
      ...positiveFeedbackEvents,
      {
        id: "evt_tool_006",
        timestamp: new Date("2024-01-15T16:07:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "compose_draft",
          input: {
            context:
              "Customer expressing gratitude for excellent support from Lisa regarding integration issue resolution.",
            tone: "professional",
            customer_name: "Anna",
          },
          output: {
            draft:
              "Dear Anna, Thank you so much for taking the time to share such wonderful feedback! We're thrilled to hear that Lisa was able to help resolve your integration issue and that you had such a positive experience. I'll be sure to pass along your kind words to Lisa and the team. Your satisfaction is our top priority, and feedback like yours truly makes our day! Please don't hesitate to reach out if you need any assistance in the future.",
            confidence: 0.95,
          },
        },
      },
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "finalize_draft",
      args: {
        thread_id: "thread_321",
        draft:
          "Dear Anna, Thank you so much for taking the time to share such wonderful feedback! We're thrilled to hear that Lisa was able to help resolve your integration issue and that you had such a positive experience. I'll be sure to pass along your kind words to Lisa and the team. Your satisfaction is our top priority, and feedback like yours truly makes our day! Please don't hesitate to reach out if you need any assistance in the future.",
        include_signature: true,
      },
    },
  },

  // Test 8: Simple one-line thank you - still follows full policy
  {
    name: "Simple thank you - search knowledge base first",
    events: [
      {
        id: "evt_simple_001",
        timestamp: new Date("2024-01-15T17:00:00Z"),
        type: "thread_started",
        actor: "customer",
        data: {
          threadId: "thread_322",
          from: "quick.customer@company.com",
          subject: "Thanks!",
          body: "Thanks for the quick help with my API issue!",
        },
      },
      {
        id: "evt_simple_002",
        timestamp: new Date("2024-01-15T17:01:00Z"),
        type: "email_processed",
        actor: "system",
        data: {
          threadId: "thread_322",
          keywords: ["thanks", "quick", "help", "API"],
          sentiment: "positive",
          urgency: "low",
        },
      },
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "search_knowledge_base",
      args: {
        query: "thanks quick help API response",
        limit: 5,
      },
    },
  },
];

// Export for use in test runner
export default positiveFeedbackPolicyEvalTests;
