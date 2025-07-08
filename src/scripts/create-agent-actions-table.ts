import Database from 'better-sqlite3';
import { env } from '../config/environment';

const sqlite = new Database(env.DATABASE_URL);

const createTableSQL = `
CREATE TABLE IF NOT EXISTS agent_actions (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  agent_run_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  tool_call_id TEXT NOT NULL,
  description TEXT NOT NULL,
  parameters TEXT NOT NULL,
  result TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  timestamp INTEGER NOT NULL,
  step_id TEXT NOT NULL,
  FOREIGN KEY (thread_id) REFERENCES email_threads(id) ON DELETE CASCADE
);
`;

try {
  sqlite.exec(createTableSQL);
  console.log('✅ agent_actions table created successfully');
} catch (error) {
  console.error('❌ Failed to create agent_actions table:', error);
} finally {
  sqlite.close();
}