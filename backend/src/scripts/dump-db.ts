import { db } from '../database/db.js';
import { users, threads, emails, draft_responses, agent_actions, email_tags } from '../database/schema.js';
import fs from 'fs/promises';
import path from 'path';

async function dumpDatabase() {
  try {
    console.log('🗄️ Dumping current database state...');

    // Fetch all data from each table
    const usersData = await db.select().from(users);
    const threadsData = await db.select().from(threads);
    const emailsData = await db.select().from(emails);
    const draftResponsesData = await db.select().from(draft_responses);
    const agentActionsData = await db.select().from(agent_actions);
    const emailTagsData = await db.select().from(email_tags);

    console.log(`📊 Found data:`);
    console.log(`- Users: ${usersData.length}`);
    console.log(`- Threads: ${threadsData.length}`);
    console.log(`- Emails: ${emailsData.length}`);
    console.log(`- Draft responses: ${draftResponsesData.length}`);
    console.log(`- Agent actions: ${agentActionsData.length}`);
    console.log(`- Email tags: ${emailTagsData.length}`);

    // Create the dump object
    const dump = {
      users: usersData,
      threads: threadsData,
      emails: emailsData,
      draft_responses: draftResponsesData,
      agent_actions: agentActionsData,
      email_tags: emailTagsData,
      metadata: {
        exported_at: new Date().toISOString(),
        total_records: usersData.length + threadsData.length + emailsData.length + 
                      draftResponsesData.length + agentActionsData.length + emailTagsData.length
      }
    };

    // Write to file
    const outputPath = path.join(process.cwd(), 'src', 'database', 'dump.json');
    await fs.writeFile(outputPath, JSON.stringify(dump, null, 2));

    console.log(`✅ Database dump saved to: ${outputPath}`);
    console.log(`📦 Total records exported: ${dump.metadata.total_records}`);

    return dump;
  } catch (error) {
    console.error('❌ Database dump failed:', error);
    throw error;
  }
}

// Run dump if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  dumpDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export default dumpDatabase;