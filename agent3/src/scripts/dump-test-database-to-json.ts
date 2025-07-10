import { config } from 'dotenv';
config({ path: '.env.test' });

import { db } from '../db/db';
import { emails, threads } from '../db/newschema';
import { agentActions } from '../db/newschema';
// Note: knowledgeBaseArticles table is not available in the new schema
import { writeFileSync } from 'fs';
import { join } from 'path';

interface DatabaseDump {
  exportDate: string;
  version: string;
  source: string;
  data: {
    threads: any[];
    emails: any[];
    // emailTags: any[]; // Not in new schema
    // knowledgeBaseArticles: any[]; // Not in new schema
    agentActions: any[];
  };
  statistics: {
    totalThreads: number;
    totalEmails: number;
    // totalTags: number; // Not in new schema
    // totalKBArticles: number; // Not in new schema
    totalActions: number;
  };
}

async function dumpDatabase() {
  console.log('📦 Starting TEST database export...');

  try {
    // Fetch all data
    console.log('📧 Fetching email threads...');
    const allThreads = await db.select().from(threads);
    
    console.log('📨 Fetching emails...');
    const allEmails = await db.select().from(emails);
    
    console.log('🏷️  Fetching email tags...');
    // const allTags = await db.select().from(emailTags); // Not in new schema
    
    console.log('📚 Fetching knowledge base articles...');
    // const allKBArticles = await db.select().from(knowledgeBaseArticles); // Not in new schema
    
    console.log('🤖 Fetching agent actions...');
    const allActions = await db.select().from(agentActions);

    // Create dump object
    const dump: DatabaseDump = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      source: 'test.db',
      data: {
        threads: allThreads,
        emails: allEmails,
        // emailTags: allTags, // Not in new schema
        // knowledgeBaseArticles: allKBArticles, // Not in new schema
        agentActions: allActions,
      },
      statistics: {
        totalThreads: allThreads.length,
        totalEmails: allEmails.length,
        // totalTags: allTags.length, // Not in new schema
        // totalKBArticles: allKBArticles.length, // Not in new schema
        totalActions: allActions.length,
      },
    };

    // Write to file
    const filename = `test-database-dump-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = join(process.cwd(), filename);
    
    console.log(`\n💾 Writing to ${filename}...`);
    writeFileSync(filepath, JSON.stringify(dump, null, 2), 'utf-8');

    // Print summary
    console.log('\n✅ Database export complete!');
    console.log('\n📊 Export Summary:');
    console.log(`- Email Threads: ${dump.statistics.totalThreads}`);
    console.log(`- Emails: ${dump.statistics.totalEmails}`);
    console.log(`- Email Tags: ${dump.statistics.totalTags}`);
    console.log(`- KB Articles: ${dump.statistics.totalKBArticles}`);
    console.log(`- Agent Actions: ${dump.statistics.totalActions}`);
    console.log(`\n📄 File saved to: ${filepath}`);
    console.log(`📏 File size: ${(JSON.stringify(dump).length / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

// Run the export
dumpDatabase();