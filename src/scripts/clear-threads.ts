import { db } from '../db';
import { emails, emailThreads } from '../db/schema/emails';
import { eq, sql } from 'drizzle-orm';

async function clearMultiEmailThreads() {
  console.log('🗑️  Finding and deleting multi-email threads...');
  
  // Find thread IDs that have more than one email
  const multiEmailThreads = await db
    .select({
      threadId: emails.threadId,
      emailCount: sql<number>`count(*)`.as('emailCount')
    })
    .from(emails)
    .groupBy(emails.threadId)
    .having(sql`count(*) > 1`);
  
  console.log(`📊 Found ${multiEmailThreads.length} multi-email threads`);
  
  if (multiEmailThreads.length === 0) {
    console.log('✅ No multi-email threads to delete');
    return;
  }
  
  // Delete emails from these threads
  let deletedEmailCount = 0;
  for (const thread of multiEmailThreads) {
    const deletedEmails = await db
      .delete(emails)
      .where(eq(emails.threadId, thread.threadId))
      .returning();
    deletedEmailCount += deletedEmails.length;
  }
  
  console.log(`❌ Deleted ${deletedEmailCount} emails from multi-email threads`);
  
  // Delete the threads themselves
  let deletedThreadCount = 0;
  for (const thread of multiEmailThreads) {
    const deletedThreads = await db
      .delete(emailThreads)
      .where(eq(emailThreads.id, thread.threadId))
      .returning();
    deletedThreadCount += deletedThreads.length;
  }
  
  console.log(`❌ Deleted ${deletedThreadCount} threads`);
  console.log('✅ Multi-email threads cleared successfully');
}

clearMultiEmailThreads().catch(console.error);