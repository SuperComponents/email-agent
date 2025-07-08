import { db } from '../db';
import { emails as emailsTable, emailThreads } from '../db/schema/emails';
import { eq, desc } from 'drizzle-orm';
import { writeFileSync } from 'fs';

async function listEmailsToFile() {
  console.log('📧 Fetching all emails from database...');

  // Get all emails with thread info
  const emails = await db
    .select({
      email: emailsTable,
      thread: emailThreads,
    })
    .from(emailsTable)
    .leftJoin(emailThreads, eq(emailsTable.threadId, emailThreads.id))
    .orderBy(desc(emailsTable.createdAt));

  let output = '';
  
  output += `📧 All Emails in Database\n`;
  output += `Total emails: ${emails.length}\n\n`;
  output += '═'.repeat(80) + '\n';

  // Group by thread
  const threads = new Map<string, typeof emails>();
  
  for (const record of emails) {
    const threadId = record.email.threadId;
    if (!threads.has(threadId)) {
      threads.set(threadId, []);
    }
    threads.get(threadId)!.push(record);
  }

  output += `Total threads: ${threads.size}\n\n`;

  // Display each thread
  let threadIndex = 1;
  for (const [threadId, threadEmails] of threads) {
    const firstEmail = threadEmails[0];
    output += `\n🧵 Thread ${threadIndex++}: ${firstEmail.thread?.subject || 'No subject'}\n`;
    output += `Thread ID: ${threadId}\n`;
    output += `Messages: ${threadEmails.length}\n`;
    output += '-'.repeat(80) + '\n';

    // Display each email in thread
    for (const record of threadEmails) {
      const email = record.email;
      const date = email.createdAt ? new Date(email.createdAt).toLocaleString() : 'Unknown';
      
      output += `\n📨 ${email.isIncoming ? 'INCOMING' : 'OUTGOING'} - ${date}\n`;
      output += `From: ${email.from}\n`;
      output += `To: ${email.to}\n`;
      if (email.cc) output += `CC: ${email.cc}\n`;
      output += `Subject: ${email.subject}\n`;
      output += '\nBody:\n';
      output += '-'.repeat(40) + '\n';
      output += email.body + '\n';
      output += '-'.repeat(40) + '\n';
    }
    
    output += '\n' + '═'.repeat(80) + '\n';
  }

  // Summary statistics
  output += '\n📊 Summary Statistics:\n';
  output += `- Total emails: ${emails.length}\n`;
  output += `- Total threads: ${threads.size}\n`;
  output += `- Incoming emails: ${emails.filter(e => e.email.isIncoming).length}\n`;
  output += `- Outgoing emails: ${emails.filter(e => !e.email.isIncoming).length}\n`;
  
  // Count by sender domain
  const senderDomains = new Map<string, number>();
  for (const record of emails) {
    const domain = record.email.from.split('@')[1] || 'unknown';
    senderDomains.set(domain, (senderDomains.get(domain) || 0) + 1);
  }
  
  output += '\n📮 Top sender domains:\n';
  const sortedDomains = Array.from(senderDomains.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  for (const [domain, count] of sortedDomains) {
    output += `  - ${domain}: ${count} emails\n`;
  }

  // Write to file
  const filename = 'all-emails.txt';
  writeFileSync(filename, output, 'utf-8');
  console.log(`\n✅ All emails have been written to: ${filename}`);
  console.log(`📄 File contains ${emails.length} emails in ${threads.size} threads`);
  
  // Also print to console
  console.log('\n' + output);
}

// Run the script
listEmailsToFile().catch(console.error);