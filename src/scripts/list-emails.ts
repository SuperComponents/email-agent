import { db } from '../db';
import { emails as emailsTable, emailThreads } from '../db/schema/emails';
import { eq, desc } from 'drizzle-orm';

async function listEmails() {
  console.log('📧 Fetching all emails from database...\n');

  // Get all emails with thread info
  const emails = await db
    .select({
      email: emailsTable,
      thread: emailThreads,
    })
    .from(emailsTable)
    .leftJoin(emailThreads, eq(emailsTable.threadId, emailThreads.id))
    .orderBy(desc(emailsTable.createdAt));

  console.log(`Total emails: ${emails.length}\n`);
  console.log('═'.repeat(80));

  // Group by thread
  const threads = new Map<string, typeof emails>();
  
  for (const record of emails) {
    const threadId = record.email.threadId;
    if (!threads.has(threadId)) {
      threads.set(threadId, []);
    }
    threads.get(threadId)!.push(record);
  }

  console.log(`Total threads: ${threads.size}\n`);

  // Display each thread
  let threadIndex = 1;
  for (const [threadId, threadEmails] of threads) {
    const firstEmail = threadEmails[0];
    console.log(`\n🧵 Thread ${threadIndex++}: ${firstEmail.thread?.subject || 'No subject'}`);
    console.log(`Thread ID: ${threadId}`);
    console.log(`Messages: ${threadEmails.length}`);
    console.log('-'.repeat(80));

    // Display each email in thread
    for (const record of threadEmails) {
      const email = record.email;
      const date = email.createdAt ? new Date(email.createdAt).toLocaleString() : 'Unknown';
      
      console.log(`\n📨 ${email.isIncoming ? 'INCOMING' : 'OUTGOING'} - ${date}`);
      console.log(`From: ${email.from}`);
      console.log(`To: ${email.to}`);
      if (email.cc) console.log(`CC: ${email.cc}`);
      console.log(`Subject: ${email.subject}`);
      console.log('\nBody:');
      console.log('-'.repeat(40));
      console.log(email.body);
      console.log('-'.repeat(40));
    }
    
    console.log('\n' + '═'.repeat(80));
  }

  // Summary statistics
  console.log('\n📊 Summary Statistics:');
  console.log(`- Total emails: ${emails.length}`);
  console.log(`- Total threads: ${threads.size}`);
  console.log(`- Incoming emails: ${emails.filter(e => e.email.isIncoming).length}`);
  console.log(`- Outgoing emails: ${emails.filter(e => !e.email.isIncoming).length}`);
  
  // Count by sender domain
  const senderDomains = new Map<string, number>();
  for (const record of emails) {
    const domain = record.email.from.split('@')[1] || 'unknown';
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