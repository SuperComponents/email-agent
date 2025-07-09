import { db } from '../database/db.js';
import { emails as emailsTable, threads } from '../database/schema.js';
import { eq, desc } from 'drizzle-orm';

async function listEmails() {
  console.log('📧 Fetching all emails from database...\n');

  // Get all emails with thread info
  const emails = await db
    .select({
      email: emailsTable,
      thread: threads,
    })
    .from(emailsTable)
    .leftJoin(threads, eq(emailsTable.thread_id, threads.id))
    .orderBy(desc(emailsTable.created_at));

  console.log(`Total emails: ${emails.length}\n`);
  console.log('═'.repeat(80));

  // Group by thread
  const threadMap = new Map<number, typeof emails>();
  
  for (const record of emails) {
    const threadId = record.email.thread_id;
    if (!threadMap.has(threadId)) {
      threadMap.set(threadId, []);
    }
    threadMap.get(threadId)!.push(record);
  }

  console.log(`Total threads: ${threadMap.size}\n`);

  // Display each thread
  let threadIndex = 1;
  for (const [threadId, threadEmails] of threadMap) {
    const firstEmail = threadEmails[0];
    console.log(`\n🧵 Thread ${threadIndex++}: ${firstEmail.thread?.subject || 'No subject'}`);
    console.log(`Thread ID: ${threadId}`);
    console.log(`Messages: ${threadEmails.length}`);
    console.log('-'.repeat(80));

    // Display each email in thread
    for (const record of threadEmails) {
      const email = record.email;
      const date = email.created_at ? new Date(email.created_at).toLocaleString() : 'Unknown';
      
      console.log(`\n📨 ${email.direction === 'inbound' ? 'INCOMING' : 'OUTGOING'} - ${date}`);
      console.log(`From: ${email.from_email}`);
      console.log(`To: ${(email.to_emails as string[]).join(', ')}`);
      if (email.cc_emails) console.log(`CC: ${(email.cc_emails as string[]).join(', ')}`);
      console.log(`Subject: ${email.subject}`);
      console.log('\nBody:');
      console.log('-'.repeat(40));
      console.log(email.body_text);
      console.log('-'.repeat(40));
    }
    
    console.log('\n' + '═'.repeat(80));
  }

  // Summary statistics
  console.log('\n📊 Summary Statistics:');
  console.log(`- Total emails: ${emails.length}`);
  console.log(`- Total threads: ${threadMap.size}`);
  console.log(`- Incoming emails: ${emails.filter(e => e.email.direction === 'inbound').length}`);
  console.log(`- Outgoing emails: ${emails.filter(e => e.email.direction === 'outbound').length}`);
  
  // Count by sender domain
  const senderDomains = new Map<string, number>();
  for (const record of emails) {
    const domain = record.email.from_email.split('@')[1] || 'unknown';
    senderDomains.set(domain, (senderDomains.get(domain) || 0) + 1);
  }
  
  console.log('\n📮 Top sender domains:');
  const sortedDomains = Array.from(senderDomains.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  for (const [domain, count] of sortedDomains) {
    console.log(`  - ${domain}: ${count} emails`);
  }
}

// Run the script
listEmails().catch(console.error);