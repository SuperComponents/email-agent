import { db } from '../db';
import { emails, emailThreads } from '../db/schema/emails';

async function clearDatabase() {
  console.log('🗑️  Clearing all emails from database...');
  
  // Delete all emails first (due to foreign key constraints)
  const deletedEmails = await db.delete(emails).returning();
  console.log(`❌ Deleted ${deletedEmails.length} emails`);
  
  // Delete all threads
  const deletedThreads = await db.delete(emailThreads).returning();
  console.log(`❌ Deleted ${deletedThreads.length} threads`);
  
  console.log('✅ Database cleared successfully');
}

clearDatabase().catch(console.error);