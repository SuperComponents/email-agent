import { Agent, run, fileSearchTool, setDefaultOpenAIKey } from '@openai/agents';
import { OPENAI_API_KEY } from './env.js';

setDefaultOpenAIKey(OPENAI_API_KEY)
const VECTOR_STORE_ID = 'vs_686ea940fba481918bab43cb64dd54f1';
const knowledgeBaseSearchTool = fileSearchTool(VECTOR_STORE_ID)

const supportBot = new Agent({
  name: 'OpenAI-VectorBot',
  model: 'gpt-4o-mini',
  instructions: `
You are a customer support agent for GauntletAIron, a premium armor manufacturer.
Use the file search tool to find relevant information from our product documentation.
Provide helpful, accurate answers based on the documentation.
When referencing information, mention which product or section it came from.`,
  tools: [knowledgeBaseSearchTool],
});

/* ── ask a question ──────────────────────────────────────── */
const question =
  process.argv.slice(2).join(' ') ||
  'What warranty do we offer for the dragonscale gauntlets?';

console.log(`\n❓ Question: ${question}`);

const result = await run(supportBot, question);

console.log('\n─── Answer ───\n');
// console.log(JSON.stringify(result.output, null, 2));

result.output.forEach((item) => {
  // console.log(item);
  console.log(JSON.stringify(item, null, 2));
});