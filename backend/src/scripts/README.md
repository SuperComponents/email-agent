# Email Generation Scripts

This directory contains scripts for generating realistic customer support emails for testing and development purposes.

## 📋 Available Scripts

### 1. `generate-emails.ts` - Database Generation (Original)
Generates emails and inserts them directly into the PostgreSQL database.

**Usage:**
```bash
# Generate 100 emails (default)
npm run generate:emails

# Generate 3 test emails
npm run generate:emails -- --test

# Generate specific number of emails
npm run generate:emails -- --count 50
```

**Requirements:**
- Database connection available
- `DATABASE_URL` environment variable set
- `OPENAI_API_KEY` environment variable set

---

### 2. `generate-emails-json.ts` - JSON Generation (New)
Generates emails and saves them as JSON files locally. **Perfect for when database is unavailable!**

**Usage:**
```bash
# Generate 100 emails to JSON (default)
npm run generate:emails-json

# Generate 3 test emails
npm run generate:emails-json -- --test

# Generate specific number of emails
npm run generate:emails-json -- --count 50

# Custom output file
npm run generate:emails-json -- --output my-emails.json

# Append to existing file
npm run generate:emails-json -- --append --output existing-emails.json

# Custom output directory
npm run generate:emails-json -- --output-dir custom-data
```

**Features:**
- ✅ **No database required** - Perfect for development
- ✅ **Preserves all relationships** - Threads and emails linked properly
- ✅ **Incremental generation** - Can append to existing files
- ✅ **Rich metadata** - Generation parameters, timestamps, counts
- ✅ **Database-ready format** - Easy to import later
- ✅ **Comprehensive logging** - Track every operation

**Output Structure:**
```json
{
  "metadata": {
    "generated_at": "2024-01-15T10:30:00Z",
    "total_threads": 100,
    "total_emails": 100,
    "generation_options": {
      "count": 100,
      "test": false,
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-15T23:59:59Z"
    },
    "file_info": {
      "filename": "emails-2024-01-15-103000.json",
      "batch_number": 5,
      "appended_to_existing": false
    }
  },
  "threads": [...],
  "emails": [...]
}
```

---

### 3. `json-to-sql.ts` - SQL Import Generator
Converts JSON email data to SQL INSERT statements for database import.

**Usage:**
```bash
# Convert JSON to SQL
npm run json-to-sql -- --input emails-data/emails-2024-01-15.json

# Custom output file
npm run json-to-sql -- --input emails-data/emails-2024-01-15.json --output import.sql

# Include TRUNCATE statements (clears existing data)
npm run json-to-sql -- --input emails-data/emails-2024-01-15.json --truncate

# Help
npm run json-to-sql -- --help
```

**Features:**
- ✅ **Complete SQL import** - Threads and emails with relationships
- ✅ **Proper escaping** - Handles special characters safely
- ✅ **Sequence updates** - Prevents ID conflicts
- ✅ **Verification queries** - Check import success
- ✅ **Truncate option** - Clear existing data if needed

---

## 🔄 Typical Workflow

### Development (No Database)
```bash
# 1. Generate emails to JSON
npm run generate:emails-json -- --test

# 2. Review the JSON file
cat emails-data/emails-*.json | head -50

# 3. Generate more emails (append to existing)
npm run generate:emails-json -- --count 20 --append

# 4. When database is ready, convert to SQL
npm run json-to-sql -- --input emails-data/emails-*.json

# 5. Import to database
psql -U your_user -d your_database -f emails-data/emails-*.sql
```

### Production (Database Available)
```bash
# Direct database insertion
npm run generate:emails -- --count 100
```

---

## 🏢 Generated Email Content

The AI generates realistic customer support emails for **Treslingo**, a fictional Spanish learning app similar to Duolingo:

**App Features:**
- Free tier: Basic lessons, limited hearts, ads
- Premium tier ($9.99/month): No ads, unlimited hearts, offline mode
- Daily streaks with streak freezes available
- XP points, gems, leaderboards, and achievements
- Lesson types: vocabulary, grammar, speaking, listening comprehension
- Social features: friends, leaderboards, family accounts
- Mobile-only app with friendly cat mascot

**Email Categories:**
- 35% Learning support (lost streaks, progress issues, difficulty level)
- 25% Technical issues (app crashes, audio problems, syncing issues)
- 20% Billing/subscription support (charges, cancellations, premium features)
- 10% Account issues (password resets, email changes, family accounts)
- 10% Edge cases (legal complaints about copyrighted content, feature requests, angry users)

**Realistic Features:**
- Natural language with occasional typos
- Varied writing styles and education levels
- Different age groups (kids, teens, adults, seniors)
- International users with varying English proficiency
- Realistic account numbers (TR-XXXXX format)
- Detailed customer explanations about learning progress
- Appropriate tone for frustrated learners, excited students, confused parents

---

## 🛠️ Technical Details

### File Organization
```
backend/
├── emails-data/              # Generated JSON files
│   ├── emails-2024-01-15-103000.json
│   ├── emails-2024-01-15-104500.json
│   └── emails-master.json
└── src/scripts/
    ├── generate-emails.ts         # Original database script
    ├── generate-emails-json.ts    # New JSON script
    ├── json-to-sql.ts            # SQL converter
    └── email-generator-ai.ts     # AI generation core
```

### Database Schema Compatibility
The JSON format matches the PostgreSQL schema exactly:

**Threads Table:**
- `id`, `subject`, `participant_emails`, `status`
- `last_activity_at`, `created_at`, `updated_at`

**Emails Table:**
- `id`, `thread_id`, `from_email`, `to_emails`, `cc_emails`, `bcc_emails`
- `subject`, `body_text`, `body_html`, `direction`, `is_draft`
- `sent_at`, `created_at`, `updated_at`

### Rate Limiting
- **20 emails per batch** (configurable)
- **2-second delay** between batches
- **Comprehensive error handling** for API failures

---

## 🚀 Quick Start

1. **Set up environment variables:**
   ```bash
   export OPENAI_API_KEY="your-openai-key"
   # DATABASE_URL only needed for direct database insertion
   ```

2. **Generate test emails:**
   ```bash
   npm run generate:emails-json -- --test
   ```

3. **Review the output:**
   ```bash
   cat emails-data/emails-*.json | jq .metadata
   ```

4. **Generate more emails:**
   ```bash
   npm run generate:emails-json -- --count 50
   ```

5. **Convert to SQL when ready:**
   ```bash
   npm run json-to-sql -- --input emails-data/emails-*.json
   ```

---

## 📊 Monitoring & Logging

All scripts provide comprehensive logging:
- **Real-time progress** - Batch processing updates
- **Error tracking** - Individual email failures
- **Performance metrics** - Generation speed, file sizes
- **Data validation** - Email format checking
- **Summary reports** - Final counts and statistics

Example output:
```
🚀 Starting JSON email generation...
📧 Target: 100 emails
📦 Processing 5 batches of up to 20 emails each

📦 Batch 1/5: Generating 20 emails...
🤖 Calling AI to generate 20 emails...
✅ AI generated 20 emails
📧 Processing email: "Question about DragonScale Gauntlets" from John Smith
✅ Created thread 1 and email 1
...
✅ Batch 1 complete: 20 emails processed

🎉 JSON Generation complete!
📊 Final Results:
  - New emails generated: 100
  - Total threads in file: 100
  - Total emails in file: 100
  - Duration: 45.2s
  - Rate: 2.2 emails/second
  - Output file: emails-data/emails-2024-01-15-103000.json
  - File size: 245.7KB
```

---

## 🔍 Troubleshooting

**Common Issues:**

1. **OpenAI API Key Missing**
   ```
   Error: OPENAI_API_KEY environment variable is required
   ```
   - Solution: Set your OpenAI API key in environment variables

2. **File Permission Errors**
   ```
   Error: EACCES: permission denied, mkdir 'emails-data'
   ```
   - Solution: Check write permissions in the backend directory

3. **JSON Parse Errors**
   ```
   Error: Invalid JSON response from GPT
   ```
   - Solution: GPT occasionally returns malformed JSON. Re-run the script.

4. **Rate Limiting**
   ```
   Error: Rate limit exceeded
   ```
   - Solution: Scripts include built-in rate limiting. Wait and retry.

**Debug Mode:**
Add extra logging by modifying the scripts to include more console.log statements.

---

## 🤝 Contributing

When modifying these scripts:

1. **Follow the logging pattern** - Add comprehensive console.log statements
2. **Maintain error handling** - Wrap operations in try-catch blocks
3. **Update this README** - Document new features and options
4. **Test with small batches** - Use `--test` flag during development
5. **Validate JSON structure** - Ensure database compatibility

---

## 📝 License

These scripts are part of the email-agent project and follow the same license terms. 