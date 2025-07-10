import { test, expect } from "vitest";
import z from "zod";
import ToolManager, { ToolDefinition } from "./context/tools";
import {
  DefaultContextGenerator,
  DefaultContextGeneratorV2,
} from "./context/context";
import { Event } from "./types";
import { LLMClient } from "./llm";
import {
  SummarizeUsefulContextTool,
  UpdateThreadUrgencyTool,
  UpdateThreadCategoryTool,
  ComposeDraftToolMock,
  UserActionNeededTool,
  FinalizeDraftTool,
} from "./mocktools";
import RAGTool from "./tools/rag";
import runAgentLoop from "./agent-loop";
import ComposeDraftTool from "./tools/compose-draft";
import { prettyPrint } from "./utils";

// Create instances of the mock tools
const mockTools: ToolDefinition[] = [
  new SummarizeUsefulContextTool(),
  new UpdateThreadUrgencyTool(),
  new UpdateThreadCategoryTool(),
  new ComposeDraftToolMock(),
  new UserActionNeededTool(),
  new FinalizeDraftTool(),
];

test("First updates the urgency of the thread, has only 1 tool", async () => {
  // arrange
  const toolManager = new ToolManager();
  const tool = new UpdateThreadUrgencyTool();
  toolManager.registerTool(tool);

  const eventLog: Event[] = [
    {
      timestamp: new Date(),
      type: "email_received",
      actor: "customer",
      id: "1",
      data: {
        subject: "Unable to login to my account",
        body: 'Hi, I have been trying to login to my account for the past hour but keep getting an error message saying "Invalid credentials". I am sure I am using the correct password. Can you please help me resolve this issue? My email is john.doe@example.com. Thank you.',
        from: "john.doe@example.com",
        to: "support@company.com",
      },
    },
  ];
  const contextGenerator = new DefaultContextGenerator(toolManager);

  const client = new LLMClient();
  // action
  const response = await client.getNextToolCall(
    contextGenerator.getSystemPrompt(),
    contextGenerator.getMessage(eventLog)
  );

  // assert
  expect(response).toBeDefined();
  expect(response.tool_call).toBeDefined();
  expect(response.tool_call.name).toBe(tool.name);
  expect(response.tool_call.args).toBeDefined();
  expect(response.tool_call.args.urgency).toBe("high");
});

test("run with actual rag tool", async () => {
  const toolManager = new ToolManager();
  toolManager.registerTool(new RAGTool());
  toolManager.registerTool(new SummarizeUsefulContextTool());
  toolManager.registerTool(new UpdateThreadUrgencyTool());
  toolManager.registerTool(new UpdateThreadCategoryTool());
  toolManager.registerTool(new ComposeDraftTool());
  toolManager.registerTool(new UserActionNeededTool());
  toolManager.registerTool(new FinalizeDraftTool());

  const eventLog: Event[] = [
    {
      timestamp: new Date(),
      type: "email_received",
      actor: "customer",
      id: "1",
      data: {
        subject: "I want to file my warranty claim",
        body: "Hi, my gauntlets are broken and I have them for 40 days. I want to file a warranty claim.",
        from: "john.doe@example.com",
        to: "support@company.com",
      },
    },
  ];

  const client = new LLMClient("gpt-4o-mini");
  const contextGenerator = new DefaultContextGeneratorV2(toolManager);

  let result = await runAgentLoop(eventLog, toolManager);

  console.log(result);
  console.log("\n--- Pretty Print of Events ---");
  console.log(prettyPrint(result));

  // Save the result to events.txt
  const fs = require("fs");
  const path = require("path");

  const eventsFilePath = path.join(__dirname, "..", "..", "events.txt");
  const prettyPrintedEvents = prettyPrint(result);

  fs.writeFileSync(eventsFilePath, JSON.stringify(result, null, 2), "utf8");
  console.log(`Events saved to ${eventsFilePath}`);
}, 100000);
