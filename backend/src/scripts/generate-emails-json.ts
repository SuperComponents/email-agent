import { generateEmailBatch } from './email-generator-ai.js';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface GenerateOptions {
  count: number;
  test: boolean;
  startDate?: Date;
  endDate?: Date;
  output?: string;
  append?: boolean;
  outputDir?: string;
}

interface ThreadRecord {
  id: number;
  subject: string;
  participant_emails: string[];
  status: 'active' | 'closed' | 'needs_attention';
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

interface EmailRecord {
  id: number;
  thread_id: number;
  from_email: string;
  to_emails: string[];
  cc_emails: string[] | null;
  bcc_emails: string[] | null;
  subject: string;
  body_text: string;
  body_html: string;
  direction: 'inbound' | 'outbound';
  is_draft: boolean;
  sent_at: string;
  created_at: string;
  updated_at: string;
}

interface EmailDataSet {
  metadata: {
    generated_at: string;
    total_threads: number;
    total_emails: number;
    generation_options: {
      count: number;
      test: boolean;
      startDate: string;
      endDate: string;
    };
    file_info: {
      filename: string;
      batch_number?: number;
      appended_to_existing?: boolean;
    };
  };
  threads: ThreadRecord[];
  emails: EmailRecord[];
}

function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);
  const options: GenerateOptions = {
    count: 100,
    test: false,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
    outputDir: 'emails-data',
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--test':
        console.log('🧪 TEST MODE: Generating 3 emails only');
        options.test = true;
        options.count = 3;
        break;
      case '--count':
        options.count = parseInt(args[++i], 10);
        console.log(`📊 COUNT: Generating ${options.count} emails`);
        break;
      case '--output':
        options.output = args[++i];
        console.log(`📄 OUTPUT: Using custom filename: ${options.output}`);
        break;
      case '--append':
        options.append = true;
        console.log('📝 APPEND MODE: Will append to existing file');
        break;
      case '--output-dir':
        options.outputDir = args[++i];
        console.log(`📁 OUTPUT DIR: Using directory: ${options.outputDir}`);
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

function setupOutputDirectory(dir: string): void {
  if (!existsSync(dir)) {
    console.log(`📁 Creating output directory: ${dir}`);
    mkdirSync(dir, { recursive: true });
  } else {
    console.log(`📁 Using existing output directory: ${dir}`);
  }
}

function generateIds(existingData?: EmailDataSet | null): { nextThreadId: number; nextEmailId: number } {
  if (!existingData) {
    return { nextThreadId: 1, nextEmailId: 1 };
  }

  const maxThreadId = Math.max(...existingData.threads.map(t => t.id), 0);
  const maxEmailId = Math.max(...existingData.emails.map(e => e.id), 0);

  return {
    nextThreadId: maxThreadId + 1,
    nextEmailId: maxEmailId + 1,
  };
}

function createEmailRecord(
  email: { subject: string; body: string; senderName: string; senderEmail: string },
  emailId: number,
  threadId: number,
  timestamp: Date
): EmailRecord {
  const timestampStr = timestamp.toISOString();
  
  return {
    id: emailId,
    thread_id: threadId,
    from_email: email.senderEmail,
    to_emails: ['support@treslingo.com'],
    cc_emails: null,
    bcc_emails: null,
    subject: email.subject,
    body_text: email.body,
    body_html: `<html><body>${email.body.replace(/\n/g, '<br>')}</body></html>`,
    direction: 'inbound',
    is_draft: false,
    sent_at: timestampStr,
    created_at: timestampStr,
    updated_at: timestampStr,
  };
}

function createThreadRecord(
  email: { subject: string; body: string; senderName: string; senderEmail: string },
  threadId: number,
  timestamp: Date
): ThreadRecord {
  const timestampStr = timestamp.toISOString();
  
  return {
    id: threadId,
    subject: email.subject,
    participant_emails: [email.senderEmail, 'support@treslingo.com'],
    status: 'active',
    last_activity_at: timestampStr,
    created_at: timestampStr,
    updated_at: timestampStr,
  };
}

function loadExistingData(filepath: string): EmailDataSet | null {
  try {
    if (existsSync(filepath)) {
      console.log(`📖 Loading existing data from: ${filepath}`);
      const data = readFileSync(filepath, 'utf8');
      const parsed = JSON.parse(data) as EmailDataSet;
      console.log(`📊 Existing data: ${parsed.threads.length} threads, ${parsed.emails.length} emails`);
      return parsed;
    }
  } catch (error) {
    console.error(`❌ Failed to load existing data: ${error}`);
  }
  return null;
}

function saveEmailData(data: EmailDataSet, filepath: string): void {
  try {
    console.log(`💾 Saving data to: ${filepath}`);
    console.log(`📊 Data summary: ${data.threads.length} threads, ${data.emails.length} emails`);
    
    const jsonString = JSON.stringify(data, null, 2);
    writeFileSync(filepath, jsonString, 'utf8');
    
    console.log(`✅ Successfully saved ${(jsonString.length / 1024).toFixed(1)}KB to ${filepath}`);
  } catch (error) {
    console.error(`❌ Failed to save data: ${error}`);
    throw error;
  }
}

async function generateAndSaveEmails(options: GenerateOptions): Promise<void> {
  console.log(`🚀 Starting JSON email generation...`);
  console.log(`📧 Target: ${options.count} emails`);
  console.log(`📅 Date range: ${options.startDate?.toISOString()} to ${options.endDate?.toISOString()}`);

  const startTime = Date.now();
  let generated = 0;
  let errors = 0;

  // Setup output directory
  setupOutputDirectory(options.outputDir!);

  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = options.output || `emails-${timestamp}.json`;
  const filepath = join(options.outputDir!, filename);

  console.log(`📄 Output file: ${filepath}`);

  // Load existing data if appending
  let existingData: EmailDataSet | null = null;
  if (options.append) {
    existingData = loadExistingData(filepath);
  }

  // Generate ID starting points
  const { nextThreadId, nextEmailId } = generateIds(existingData);
  console.log(`🔢 Starting IDs - Thread: ${nextThreadId}, Email: ${nextEmailId}`);

  // Initialize data structure
  const emailDataSet: EmailDataSet = {
    metadata: {
      generated_at: new Date().toISOString(),
      total_threads: existingData?.threads.length || 0,
      total_emails: existingData?.emails.length || 0,
      generation_options: {
        count: options.count,
        test: options.test,
        startDate: options.startDate!.toISOString(),
        endDate: options.endDate!.toISOString(),
      },
      file_info: {
        filename,
        appended_to_existing: !!existingData,
      },
    },
    threads: existingData?.threads || [],
    emails: existingData?.emails || [],
  };

  try {
    // Calculate batches
    const batchSize = 20;
    const batches = Math.ceil(options.count / batchSize);
    console.log(`📦 Processing ${batches} batches of up to ${batchSize} emails each`);

    let currentThreadId = nextThreadId;
    let currentEmailId = nextEmailId;

    for (let batch = 0; batch < batches; batch++) {
      const remaining = options.count - generated;
      const currentBatchSize = Math.min(batchSize, remaining);

      console.log(`\n📦 Batch ${batch + 1}/${batches}: Generating ${currentBatchSize} emails...`);

      try {
        // Generate batch of emails using AI
        console.log(`🤖 Calling AI to generate ${currentBatchSize} emails...`);
        const generatedEmails = await generateEmailBatch(currentBatchSize);
        console.log(`✅ AI generated ${generatedEmails.length} emails`);

        // Process each email
        for (const email of generatedEmails) {
          try {
            const timestamp = getRandomTimestamp(options.startDate!, options.endDate!);
            console.log(`📧 Processing email: "${email.subject}" from ${email.senderName}`);

            // Create thread record
            const threadRecord = createThreadRecord(email, currentThreadId, timestamp);
            emailDataSet.threads.push(threadRecord);

            // Create email record
            const emailRecord = createEmailRecord(email, currentEmailId, currentThreadId, timestamp);
            emailDataSet.emails.push(emailRecord);

            console.log(`✅ Created thread ${currentThreadId} and email ${currentEmailId}`);

            currentThreadId++;
            currentEmailId++;
            generated++;
          } catch (error) {
            console.error(`❌ Failed to process email from ${email.senderName}: ${error}`);
            errors++;
          }
        }

        console.log(`✅ Batch ${batch + 1} complete: ${generatedEmails.length} emails processed`);

      } catch (error) {
        console.error(`❌ Failed to generate batch ${batch + 1}: ${error}`);
        errors += currentBatchSize;
      }

      // Add delay between batches to avoid rate limiting
      if (batch < batches - 1) {
        console.log(`⏳ Waiting 2 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Update metadata with final counts
    emailDataSet.metadata.total_threads = emailDataSet.threads.length;
    emailDataSet.metadata.total_emails = emailDataSet.emails.length;
    emailDataSet.metadata.file_info.batch_number = batches;

    // Save final data
    saveEmailData(emailDataSet, filepath);

  } catch (error) {
    console.error('\n❌ Fatal error during generation:', error);
    throw error;
  }

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\n🎉 JSON Generation complete!`);
  console.log(`📊 Final Results:`);
  console.log(`  - New emails generated: ${generated}`);
  console.log(`  - Total threads in file: ${emailDataSet.metadata.total_threads}`);
  console.log(`  - Total emails in file: ${emailDataSet.metadata.total_emails}`);
  console.log(`  - Errors: ${errors}`);
  console.log(`  - Duration: ${duration.toFixed(1)}s`);
  console.log(`  - Rate: ${(generated / duration).toFixed(1)} emails/second`);
  console.log(`  - Output file: ${filepath}`);
  console.log(`  - File size: ${(JSON.stringify(emailDataSet).length / 1024).toFixed(1)}KB`);
}

// Main execution
async function main() {
  const options = parseArgs();

  console.log('\n🔄 JSON Email Generation Mode');
  console.log('=====================================');
  
  if (options.test) {
    console.log('🧪 Running in TEST mode');
  }

  try {
    await generateAndSaveEmails(options);
    console.log('\n✅ All operations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 