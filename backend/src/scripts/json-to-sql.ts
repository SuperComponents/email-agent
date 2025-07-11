import { readFileSync, writeFileSync } from 'fs';

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

function parseArgs(): { input: string; output?: string; truncate?: boolean } {
  const args = process.argv.slice(2);
  const options: { input: string; output?: string; truncate?: boolean } = {
    input: '',
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        options.input = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--truncate':
        options.truncate = true;
        break;
      case '--help':
        console.log(`
JSON to SQL Converter
Usage: npm run json-to-sql -- --input <json-file> [options]

Options:
  --input <file>     Input JSON file (required)
  --output <file>    Output SQL file (default: input filename with .sql extension)
  --truncate         Add TRUNCATE statements to clear existing data
  --help             Show this help message

Examples:
  npm run json-to-sql -- --input emails-data/emails-2024-01-15.json
  npm run json-to-sql -- --input emails-data/emails-2024-01-15.json --output import.sql --truncate
        `);
        process.exit(0);
        break;
    }
  }

  if (!options.input) {
    console.error('❌ Error: --input parameter is required');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  return options;
}

function escapeString(str: string): string {
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

function formatJsonArray(arr: any[]): string {
  return `'${JSON.stringify(arr).replace(/'/g, "''")}'`;
}

function generateThreadInserts(threads: ThreadRecord[]): string[] {
  return threads.map(thread => {
    const participantEmails = formatJsonArray(thread.participant_emails);
    
    return `INSERT INTO threads (id, subject, participant_emails, status, last_activity_at, created_at, updated_at) VALUES (
  ${thread.id},
  '${escapeString(thread.subject)}',
  ${participantEmails},
  '${thread.status}',
  '${thread.last_activity_at}',
  '${thread.created_at}',
  '${thread.updated_at}'
);`;
  });
}

function generateEmailInserts(emails: EmailRecord[]): string[] {
  return emails.map(email => {
    const toEmails = formatJsonArray(email.to_emails);
    const ccEmails = email.cc_emails ? formatJsonArray(email.cc_emails) : 'NULL';
    const bccEmails = email.bcc_emails ? formatJsonArray(email.bcc_emails) : 'NULL';
    
    return `INSERT INTO emails (id, thread_id, from_email, to_emails, cc_emails, bcc_emails, subject, body_text, body_html, direction, is_draft, sent_at, created_at, updated_at) VALUES (
  ${email.id},
  ${email.thread_id},
  '${escapeString(email.from_email)}',
  ${toEmails},
  ${ccEmails},
  ${bccEmails},
  '${escapeString(email.subject)}',
  '${escapeString(email.body_text)}',
  '${escapeString(email.body_html)}',
  '${email.direction}',
  ${email.is_draft},
  '${email.sent_at}',
  '${email.created_at}',
  '${email.updated_at}'
);`;
  });
}

function generateSQLFile(data: EmailDataSet, options: { truncate?: boolean }): string {
  const lines: string[] = [];

  // Add header comment
  lines.push('-- Generated SQL from JSON email data');
  lines.push(`-- Generated at: ${new Date().toISOString()}`);
  lines.push(`-- Source data generated at: ${data.metadata.generated_at}`);
  lines.push(`-- Total threads: ${data.metadata.total_threads}`);
  lines.push(`-- Total emails: ${data.metadata.total_emails}`);
  lines.push('');

  // Add truncate statements if requested
  if (options.truncate) {
    lines.push('-- Clear existing data (use with caution!)');
    lines.push('TRUNCATE TABLE emails CASCADE;');
    lines.push('TRUNCATE TABLE threads CASCADE;');
    lines.push('');
  }

  // Add threads
  lines.push('-- Insert threads');
  lines.push('BEGIN;');
  lines.push('');
  
  const threadInserts = generateThreadInserts(data.threads);
  lines.push(...threadInserts);
  
  lines.push('');
  lines.push('-- Insert emails');
  lines.push('');
  
  const emailInserts = generateEmailInserts(data.emails);
  lines.push(...emailInserts);
  
  lines.push('');
  lines.push('COMMIT;');
  lines.push('');

  // Add sequence updates
  lines.push('-- Update sequences to prevent ID conflicts');
  lines.push(`SELECT setval('threads_id_seq', ${Math.max(...data.threads.map(t => t.id))}, true);`);
  lines.push(`SELECT setval('emails_id_seq', ${Math.max(...data.emails.map(e => e.id))}, true);`);
  lines.push('');

  // Add verification queries
  lines.push('-- Verification queries');
  lines.push('SELECT COUNT(*) as thread_count FROM threads;');
  lines.push('SELECT COUNT(*) as email_count FROM emails;');
  lines.push('SELECT COUNT(*) as emails_with_threads FROM emails e JOIN threads t ON e.thread_id = t.id;');

  return lines.join('\n');
}

async function main() {
  const options = parseArgs();
  
  console.log('🔄 JSON to SQL Converter');
  console.log('========================');
  console.log(`📄 Input file: ${options.input}`);

  try {
    // Read JSON file
    console.log('📖 Reading JSON file...');
    const jsonData = readFileSync(options.input, 'utf8');
    const data = JSON.parse(jsonData) as EmailDataSet;

    console.log(`📊 Data loaded:`);
    console.log(`  - Threads: ${data.threads.length}`);
    console.log(`  - Emails: ${data.emails.length}`);
    console.log(`  - Generated at: ${data.metadata.generated_at}`);

    // Generate SQL
    console.log('🔄 Generating SQL statements...');
    const sql = generateSQLFile(data, { truncate: options.truncate });

    // Determine output filename
    const outputFile = options.output || options.input.replace('.json', '.sql');
    console.log(`📄 Output file: ${outputFile}`);

    // Write SQL file
    console.log('💾 Writing SQL file...');
    writeFileSync(outputFile, sql, 'utf8');

    console.log('✅ SQL file generated successfully!');
    console.log(`📊 File size: ${(sql.length / 1024).toFixed(1)}KB`);
    
    if (options.truncate) {
      console.log('⚠️  WARNING: SQL file includes TRUNCATE statements!');
      console.log('   Review the file before running it on production data.');
    }

    console.log('\n🚀 To import to database:');
    console.log(`   psql -U your_user -d your_database -f ${outputFile}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 