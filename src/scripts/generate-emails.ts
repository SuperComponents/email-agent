import { randomUUID } from 'crypto';
import { db } from '../db';
import { emails as emailsTable, emailThreads } from '../db/schema/emails';
import { generateEmailBatch } from './email-generator-ai';

interface GenerateOptions {
  count: number;
  test: boolean;
  startDate?: Date;
  endDate?: Date;
}

function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);
  const options: GenerateOptions = {
    count: 100,
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

async function insertEmail(
  email: { subject: string; body: string; senderName: string; senderEmail: string },
  timestamp: Date
) {
  const emailId = randomUUID();
  const threadId = randomUUID();
  
  // Create thread for this email
  await db.insert(emailThreads).values({
    id: threadId,
    subject: email.subject,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  
  // Insert email
  await db.insert(emailsTable).values({
    id: emailId,
    threadId,
    from: email.senderEmail,
    to: 'support@gauntletairon.com',
    cc: null,
    subject: email.subject,
    body: email.body,
    isIncoming: true,
    createdAt: timestamp,
  });
}

async function generateAndInsertEmails(options: GenerateOptions) {
  console.log(`🚀 Starting email generation...`);
  console.log(`📧 Generating ${options.count} emails using batch API`);
  
  const startTime = Date.now();
  let generated = 0;
  let errors = 0;

  try {
    // Calculate batches
    const batchSize = 40;
    const batches = Math.ceil(options.count / batchSize);
    
    for (let batch = 0; batch < batches; batch++) {
      const remaining = options.count - generated;
      const currentBatchSize = Math.min(batchSize, remaining);
      
      console.log(`\n📦 Generating batch ${batch + 1}/${batches} (${currentBatchSize} emails)...`);
      
      try {
        // Generate batch of emails
        const emails = await generateEmailBatch(currentBatchSize);
        
        // Insert each email
        for (const email of emails) {
          try {
            const timestamp = getRandomTimestamp(options.startDate!, options.endDate!);
            await insertEmail(email, timestamp);
            generated++;
          } catch (error) {
            console.error(`  ✗ Failed to insert email:`, error);
            errors++;
          }
        }
        
        console.log(`  ✓ Batch ${batch + 1} complete: ${emails.length} emails generated`);
        
      } catch (error) {
        console.error(`  ✗ Failed to generate batch ${batch + 1}:`, error);
        errors += currentBatchSize;
      }
      
      // Add delay between batches to avoid rate limiting
      if (batch < batches - 1) {
        console.log(`  ⏳ Waiting 2 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

  } catch (error) {
    console.error('\n❌ Fatal error during generation:', error);
  }

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\n✅ Generation complete!`);
  console.log(`📊 Results:`);
  console.log(`  - Total emails generated: ${generated}`);
  console.log(`  - Errors: ${errors}`);
  console.log(`  - Duration: ${duration.toFixed(1)}s`);
  console.log(`  - Rate: ${(generated / duration).toFixed(1)} emails/second`);
}

// Main execution
async function main() {
  const options = parseArgs();
  
  if (options.test) {
    console.log('🧪 Running in TEST mode - generating 3 emails only\n');
  }

  await generateAndInsertEmails(options);
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});