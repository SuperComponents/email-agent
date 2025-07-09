import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { OpenAIEmbeddings } from '@langchain/openai';

import db from './db.js';
import { SUPPORT_DOCS_TABLE, DOCS_PATH } from './env.js';

/* ── 1. Load all .md files via LangChain loaders ──────────────── */
const mdLoader = new DirectoryLoader(DOCS_PATH, {
  '.md': (filePath: string) => new TextLoader(filePath), // keep raw markdown
});
const rawDocs = await mdLoader.load(); // returns Document[]

/* ── 2. Chunk them (512 chars w/ 64 overlap) ─────────────────── */
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 64,
});
const docs = await splitter.splitDocuments(rawDocs); // ↯ same API

/* ── 3. Embed + upsert into Postgres/pgvector ────────────────── */
await PGVectorStore.fromDocuments(
  docs,
  new OpenAIEmbeddings({ model: 'text-embedding-3-small' }),
  { pool: db, tableName: SUPPORT_DOCS_TABLE } // table auto-creates
);

console.log(`✅ Seeded ${docs.length} chunks into '${SUPPORT_DOCS_TABLE}'`);
await db.end();
