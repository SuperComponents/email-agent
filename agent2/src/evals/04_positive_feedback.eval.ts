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

// Positive Feedback Scenario: Customer sends thank you message
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
      body: "Hi team, I just wanted to reach out and thank you for the amazing support I received yesterday. Lisa was incredibly helpful in resolving my integration issue and went above and beyond to ensure everything was working perfectly. The response time was fantastic and the solution was exactly what I needed. Keep up the great work!"
    }
  },
  
  // Event 2: System processes initial email
  {
    id: "evt_002",
    timestamp: new Date("2024-01-15T16:01:00Z"),
    type: "email_processed",
    actor: "system",
    data: {
      threadId: "thread_321",
      keywords: ["thank you", "excellent", "support", "amazing", "helpful", "great work"],
      sentiment: "positive",
      urgency: "low"
    }
  },

  // Event 3: Customer adds more praise
  {
    id: "evt_003",
    timestamp: new Date("2024-01-15T16:05:00Z"),
    type: "reply_received",
    actor: "customer",
    data: {
      threadId: "thread_321",
      body: "I also wanted to mention that your knowledge base documentation is really well-written and comprehensive. It helped me understand the integration process much better. Your team should be proud of the quality of support you provide!"
    }
  }
];

// Test cases for positive feedback scenario
export const positiveFeedbackEvalTests: EvalTest[] = [
  // Test 1: Initial positive feedback - should immediately compose thank you response
  {
    name: "Initial positive feedback - compose thank you response",
    events: [positiveFeedbackEvents[0], positiveFeedbackEvents[1]],
    tools: mockTools,
    expectedToolCall: {
      name: "compose_draft",
      args: {
        context: "Customer expressing gratitude for excellent support received. Praised team member Lisa for integration help and overall response time.",
        tone: "professional",
        customer_name: "Anna"
      }
    }
  },

  // Test 2: After composing initial draft - should finalize without further processing
  {
    name: "After composing initial draft - finalize response",
    events: [
      ...positiveFeedbackEvents.slice(0, 2),
      {
        id: "evt_tool_001",
        timestamp: new Date("2024-01-15T16:02:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "compose_draft",
          input: {
            context: "Customer expressing gratitude for excellent support received. Praised team member Lisa for integration help and overall response time.",
            tone: "professional",
            customer_name: "Anna"
          },
          output: {
            draft: "Dear Anna, Thank you so much for your kind words! We're thrilled to hear that Lisa was able to help resolve your integration issue and that you had such a positive experience with our support team. I'll be sure to pass along your feedback to Lisa and the team. Your satisfaction is our top priority, and it's wonderful to know we met your expectations. Please don't hesitate to reach out if you need any assistance in the future.",
            confidence: 0.95
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "finalize_draft",
      args: {
        thread_id: "thread_321",
        draft: "Dear Anna, Thank you so much for your kind words! We're thrilled to hear that Lisa was able to help resolve your integration issue and that you had such a positive experience with our support team. I'll be sure to pass along your feedback to Lisa and the team. Your satisfaction is our top priority, and it's wonderful to know we met your expectations. Please don't hesitate to reach out if you need any assistance in the future.",
        include_signature: true
      }
    }
  },

  // Test 3: When customer adds more praise - should update urgency to low
  {
    name: "Customer adds more praise - update urgency to low",
    events: [
      ...positiveFeedbackEvents
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "update_thread_urgency",
      args: {
        thread_id: "thread_321",
        urgency: "low"
      }
    }
  },

  // Test 4: After urgency update - should compose comprehensive thank you
  {
    name: "After urgency update - compose comprehensive thank you",
    events: [
      ...positiveFeedbackEvents,
      {
        id: "evt_tool_002",
        timestamp: new Date("2024-01-15T16:06:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "update_thread_urgency",
          input: { thread_id: "thread_321", urgency: "low" },
          output: { success: true }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "compose_draft",
      args: {
        context: "Customer expressing extensive gratitude for excellent support from Lisa and praising knowledge base documentation quality.",
        tone: "professional",
        customer_name: "Anna"
      }
    }
  },

  // Test 5: Final comprehensive response completion
  {
    name: "Final comprehensive response completion",
    events: [
      ...positiveFeedbackEvents,
      {
        id: "evt_tool_003",
        timestamp: new Date("2024-01-15T16:07:00Z"),
        type: "tool_call",
        actor: "system",
        data: {
          tool: "compose_draft",
          input: {
            context: "Customer expressing extensive gratitude for excellent support from Lisa and praising knowledge base documentation quality.",
            tone: "professional",
            customer_name: "Anna"
          },
          output: {
            draft: "Dear Anna, Thank you so much for taking the time to share such wonderful feedback! We're absolutely delighted to hear about your positive experience with Lisa and our support team. I'll make sure to pass along your kind words to Lisa and the entire team - feedback like yours truly makes our day! We're also thrilled that you found our knowledge base documentation helpful. We put a lot of effort into making it comprehensive and user-friendly, so it's great to know it's serving you well. Your satisfaction is our top priority, and we're here whenever you need us.",
            confidence: 0.95
          }
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "finalize_draft",
      args: {
        thread_id: "thread_321",
        draft: "Dear Anna, Thank you so much for taking the time to share such wonderful feedback! We're absolutely delighted to hear about your positive experience with Lisa and our support team. I'll make sure to pass along your kind words to Lisa and the entire team - feedback like yours truly makes our day! We're also thrilled that you found our knowledge base documentation helpful. We put a lot of effort into making it comprehensive and user-friendly, so it's great to know it's serving you well. Your satisfaction is our top priority, and we're here whenever you need us.",
        include_signature: true
      }
    }
  },

  // Test 6: Simple one-line thank you - should compose brief response
  {
    name: "Simple one-line thank you - compose brief response",
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
          body: "Thanks for the quick help with my API issue!"
        }
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
          urgency: "low"
        }
      }
    ],
    tools: mockTools,
    expectedToolCall: {
      name: "compose_draft",
      args: {
        context: "Customer expressing brief gratitude for quick API issue resolution.",
        tone: "friendly",
        customer_name: "Customer"
      }
    }
  }
];

// Export for use in test runner
export default positiveFeedbackEvalTests;