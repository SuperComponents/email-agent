import { config } from 'dotenv';
config({ path: '.env.test' });

import { db } from '../db/db';
import { agentActions } from '../db/newschema';
import { threads } from '../db/newschema';
import { eq, desc, sql } from 'drizzle-orm';

async function viewAgentActions() {
  const actions = await db
    .select({
      action: agentActions,
      thread: threads,
    })
    .from(agentActions)
    .leftJoin(threads, eq(agentActions.thread_id, threads.id))
    .orderBy(desc(agentActions.timestamp))
    .limit(50);

  console.log(`\n📊 Recent Agent Actions (${actions.length} total)\n`);
  console.log('═'.repeat(80));

  for (const record of actions) {
    const action = record.action;
    const thread = record.thread;
    
    console.log(`\n🤖 ${action.toolName}`);
    console.log(`📝 ${action.description}`);
    console.log(`🧵 Thread: ${thread?.subject || 'Unknown'}`);
    console.log(`⏰ Time: ${new Date(action.timestamp).toLocaleString()}`);
    console.log(`✅ Status: ${action.status}`);
    
    if (action.errorMessage) {
      console.log(`❌ Error: ${action.errorMessage}`);
    }
    
    console.log('-'.repeat(80));
  }

  // Summary by tool
  const toolCounts = await db
    .select({
      toolName: agentActions.toolName,
      count: sql<number>`count(*)`.as('count'),
    })
    .from(agentActions)
    .groupBy(agentActions.toolName);

  console.log('\n📈 Tool Usage Summary:');
  for (const tool of toolCounts) {
    console.log(`  - ${tool.toolName}: ${tool.count} calls`);
  }
}

viewAgentActions().catch(console.error);