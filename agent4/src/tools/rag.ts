import { ToolDefinition } from "../context/tools";
import { z } from "zod";
import {
  Agent,
  run,
  fileSearchTool,
  setDefaultOpenAIKey,
} from "@openai/agents";
import openai from "../openai";
import { OPENAI_API_KEY } from "../env";

import { OpenAI } from "openai";

setDefaultOpenAIKey(OPENAI_API_KEY!);

async function runRAGTool(query: string) {
  const VECTOR_STORE_ID = "vs_6872d5a6c80c8191bb598cce020ca4fa";

  const knowledgeBaseSearchTool = fileSearchTool(VECTOR_STORE_ID, {
    includeSearchResults: true,
  });

  const supportBot = new Agent({
    name: "OpenAI-VectorBot",
    model: "gpt-4o-mini",
    instructions: `
You are a customer support agent when referencing information, mention which product or section it came from.`,
    tools: [knowledgeBaseSearchTool],
  });

  console.log(query);
  const result = await run(supportBot, query);

  return result.output;
}

export default class RAGTool extends ToolDefinition {
  name = "search-knowledge-base";
  description =
    "Search the knowledge base for relevant articles and solutions using AI-enhanced queries.";
  args = z.object({
    query: z.string(),
  });

  result = z.object({
    results: z.array(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    ),
  });

  async execute(args: z.infer<typeof this.args>) {
    const results = await runRAGTool(args.query);

    console.log(results);
    let data = results[0].providerData?.results;
    console.log(results[0].providerData);
    console.log(data);
    if (!data) {
      throw new Error("no results");
    }
    return data;
  }
}
