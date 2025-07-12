import { db } from './db.js';
import { users, threads, emails, draft_responses, agent_actions, email_tags } from './schema.js';
import { execSync } from 'child_process';
import path from 'path';

async function seed() {
  try {
    console.log('Starting database seed...');
    
    // Clear existing data in reverse order of dependencies
    console.log('Clearing existing data...');
    await db.delete(agent_actions);
    await db.delete(draft_responses);
    await db.delete(email_tags);
    await db.delete(emails);
    await db.delete(threads);
    await db.delete(users);
    
    // Get the database connection details from environment
    const databaseUrl = process.env.DATABASE_URL || 'postgres://email_agent:email_agent_pw@localhost:5433/email_agent';
    
    // Path to the SQL dump file (data only)
    const dumpPath = path.join(process.cwd(), 'src', 'database', 'dump-data-only.sql');
    
    // Execute the SQL dump file using psql
    console.log('Loading database dump...');
    execSync(`psql "${databaseUrl}" < "${dumpPath}"`, { stdio: 'inherit' });
    
    console.log('✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export default seed;