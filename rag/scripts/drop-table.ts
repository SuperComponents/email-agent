import db from '../src/db.js';
import { SUPPORT_DOCS_TABLE } from '../src/env.js';

console.log(`🗑️  Dropping table: ${SUPPORT_DOCS_TABLE}`);

await db.query(`DROP TABLE IF EXISTS ${SUPPORT_DOCS_TABLE}`);

console.log(`✅ Table '${SUPPORT_DOCS_TABLE}' dropped successfully`);

await db.end();
