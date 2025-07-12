import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const LOGS_DIR = 'logs';

// Ensure logs directory exists
if (!existsSync(LOGS_DIR)) {
  mkdirSync(LOGS_DIR, { recursive: true });
}

export function logAgentRunResult(data: unknown): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `agent-run-${timestamp}.json`;
  const filepath = join(LOGS_DIR, filename);

  try {
    writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`Agent result logged to: ${filepath}`);
  } catch (error) {
    console.error(`Failed to write log file: ${String(error)}`);
  }
}

export function logAgentHistory(history: unknown): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `agent-history-${timestamp}.json`;
  const filepath = join(LOGS_DIR, filename);

  try {
    writeFileSync(filepath, JSON.stringify(history, null, 2));
    console.log(`Agent history logged to: ${filepath}`);
  } catch (error) {
    console.error(`Failed to write history file: ${String(error)}`);
  }
}
