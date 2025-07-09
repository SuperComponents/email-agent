import z from 'zod';

import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { OpenAIEmbeddings } from '@langchain/openai';

import { Agent, run, tool } from '@openai/agents'; // tool/Agent API :contentReference[oaicite:1]{index=1}

import db from './db.js';
import { SUPPORT_DOCS_TABLE } from './env.js';

/* ── db + vector store ───────────────────────────────────── */

const store = await PGVectorStore.initialize(
  // opens the existing table
  new OpenAIEmbeddings({ model: 'text-embedding-3-small' }),
  { pool: db, tableName: SUPPORT_DOCS_TABLE }
);
const retriever = store.asRetriever({ k: 4 });

/* ── expose retrieval as an Agents-SDK tool ──────────────── */
const searchDocs = tool({
  name: 'search_docs',
  description:
    'Semantic search over product documentation. Returns up to 4 snippets.',
  parameters: z.object({ query: z.string() }),
  async execute({ query }) {
    const docs = await retriever.invoke(query);
    return docs.map((d) => ({
      snippet: d.pageContent,
      source: d.metadata.source as string,
    }));
  },
});

/* ── build the OpenAI-powered agent ──────────────────────── */
const supportBot = new Agent({
  name: 'HelpBot',
  model: 'gpt-4o-mini',
  instructions: `
You are HelpBot. Use the search_docs tool whenever you need product facts.
Answer the user, then add a "References:" bullet list with every 'source'
field returned by the tool. Do NOT invent sources.`,
  tools: [searchDocs],
});

/* ── ask a question ──────────────────────────────────────── */
const question =
  process.argv.slice(2).join(' ') ||
  'What warranty do we offer for the dragonscale gauntlets?';

const result = await run(supportBot, question);

console.log('\n─── Answer ───\n');
console.log(result.output);
