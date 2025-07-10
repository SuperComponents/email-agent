import { randomUUID } from 'crypto';
import { db } from '../db/db';
import { emails as emailsTable, threads } from '../db/newschema';
import { generateCoherentThread } from './email-thread-generator';

interface GenerateOptions {
  count: number;
  minLength: number;
  maxLength: number;
  test: boolean;
  startDate?: Date;
  endDate?: Date;
}

function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);
  const options: GenerateOptions = {
    count: 20,
    minLength: 2,
    maxLength: 5,
    test: false,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--test':
        options.test = true;
        options.count = 3;
        break;
      case '--count':
        options.count = parseInt(args[++i], 10);
        break;
      case '--min-length':
        options.minLength = parseInt(args[++i], 10);
        break;
      case '--max-length':
        options.maxLength = parseInt(args[++i], 10);
        break;
    }
  }

  return options;
}

function getRandomTimestamp(startDate: Date, endDate: Date): Date {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}

async function insertEmailThread(
  emails: Array<{ subject: string; body: string; senderName: string; senderEmail: string; isCustomer: boolean }>,
  timestamp: Date
) {
  const threadSubject = emails[0].subject;
  
  // Create thread and get all participant emails
  const participantEmails = new Set<string>();
  emails.forEach(email => {
    participantEmails.add(email.senderEmail);
    if (email.isCustomer) {
      participantEmails.add('support@gauntletairon.com');
    }
  });
  
  const [thread] = await db.insert(threads).values({
    subject: threadSubject,
    participant_emails: Array.from(participantEmails),
    status: 'active',
    last_activity_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp,
  }).returning();

  // Insert emails with time gaps
  let currentTime = timestamp;
  
  for (const email of emails) {
    await db.insert(emailsTable).values({
      thread_id: thread.id,
      from_email: email.senderEmail,
      to_emails: email.isCustomer ? ['support@gauntletairon.com'] : [emails[0].senderEmail], // Always to the original customer
      cc_emails: null,
      bcc_emails: null,
      subject: email.subject,
      body_text: email.body,
      body_html: null,
      direction: email.isCustomer ? 'inbound' : 'outbound',
      is_draft: false,
      sent_at: currentTime,
      created_at: currentTime,
      updated_at: currentTime,
    });

    // Add 1-4 hours between emails in a thread
    currentTime = new Date(currentTime.getTime() + (1 + Math.random() * 3) * 60 * 60 * 1000);
  }
}

async function generateAndInsertThreads(options: GenerateOptions) {
  console.log(`🚀 Starting thread generation...`);
  console.log(`🧵 Generating ${options.count} threads with ${options.minLength}-${options.maxLength} emails each`);
  
  const startTime = Date.now();
  let threadsGenerated = 0;
  let emailsGenerated = 0;
  let errors = 0;

  try {
    for (let i = 0; i < options.count; i++) {
      try {
        // Random thread length between min and max
        const threadLength = options.minLength + Math.floor(Math.random() * (options.maxLength - options.minLength + 1));
        
        console.log(`\n📧 Generating thread ${i + 1}/${options.count} with ${threadLength} emails...`);
        
        const thread = await generateCoherentThread(threadLength);
        const timestamp = getRandomTimestamp(options.startDate!, options.endDate!);
        
        await insertEmailThread(thread, timestamp);
        
        threadsGenerated++;
        emailsGenerated += threadLength;
        
        console.log(`  ✓ Thread ${i + 1} created successfully`);
        
        // Add delay to avoid rate limiting
        if (i < options.count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
      } catch (error) {
        console.error(`  ✗ Failed to generate thread ${i + 1}:`, error);
        errors++;
      }
    }

  } catch (error) {
    console.error('\n❌ Fatal error during generation:', error);
  }

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\n✅ Generation complete!`);
  console.log(`📊 Results:`);
  console.log(`  - Threads generated: ${threadsGenerated}`);
  console.log(`  - Total emails generated: ${emailsGenerated}`);
  console.log(`  - Average emails per thread: ${(emailsGenerated / threadsGenerated).toFixed(1)}`);
  console.log(`  - Errors: ${errors}`);
  console.log(`  - Duration: ${duration.toFixed(1)}s`);
}

// Main execution
async function main() {
  const options = parseArgs();
  
  if (options.test) {
    console.log('🧪 Running in TEST mode - generating 3 threads only\n');
  }

  await generateAndInsertThreads(options);
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});