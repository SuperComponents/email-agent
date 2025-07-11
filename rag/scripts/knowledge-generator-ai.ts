import { OpenAI } from 'openai';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });

// Lazy initialization of OpenAI client to avoid immediate API key requirement
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface GeneratedKnowledgeDocument {
  title: string;
  category: 'policy' | 'faq' | 'troubleshooting' | 'general' | 'procedures';
  filename: string;
  content: string;
  tags: string[];
  lastUpdated: string;
}

export interface KnowledgeBatch {
  documents: GeneratedKnowledgeDocument[];
}

export interface KnowledgeGenerationOptions {
  category?: 'policy' | 'faq' | 'troubleshooting' | 'general' | 'procedures' | 'all';
  count?: number;
  includeMetadata?: boolean;
  detailLevel?: 'basic' | 'detailed' | 'comprehensive';
}

const COMPANY_CONTEXT = `
Treslingo is a popular mobile language learning app that teaches Spanish through gamified lessons, similar to Duolingo but with a friendly cat mascot.

Company Information:
- Founded: 2023
- App-only platform (iOS and Android)
- Focus: Spanish language learning exclusively
- Business Model: Freemium (free tier + premium subscription)
- Mascot: Friendly cat companion
- Headquarters: San Francisco, CA
- Support: 24/7 chat and email support

App Features:
- Free tier: Basic lessons, limited hearts (5 per day), ads between lessons
- Premium tier ($9.99/month): No ads, unlimited hearts, offline mode, advanced features
- Daily streaks with streak freezes available (3 per month for premium, 1 per month for free)
- XP points system, gems currency, leaderboards, and achievements
- Lesson types: vocabulary, grammar, speaking exercises, listening comprehension, stories
- Social features: friends, family accounts, leaderboards, group challenges
- Progress tracking across all devices
- Adaptive difficulty based on performance

Learning System:
- Bite-sized 5-10 minute lessons
- Spaced repetition for vocabulary retention
- Speaking practice with voice recognition
- Listening comprehension with native speakers
- Grammar explanations in simple terms
- Cultural context lessons about Spanish-speaking countries
- Achievement badges and rewards system

Technical Infrastructure:
- Real-time progress syncing across devices
- Offline lesson downloads (Premium only)
- Advanced analytics for learning optimization
- Regular content updates and new features
- Accessibility features for users with disabilities

Common User Issues:
- Lost streaks due to timezone changes or technical glitches
- Billing and subscription problems (charges, cancellations, refunds)
- Audio not working in speaking/listening exercises
- Progress not saving or syncing properly across devices
- Notification issues (too many reminders, not receiving reminders)
- Account recovery problems (forgotten passwords, email changes)
- Difficulty level complaints (too easy/too hard progression)
- Family account setup and management issues
- App crashes or freezing during lessons
- Speaking exercises not recognizing pronunciation
- Offline mode not working properly
- Achievement/XP tracking errors

Account Information:
- Account format: TR-XXXXX (5 digits)
- Premium subscription: $9.99/month, auto-renewal
- Family plans: Up to 6 members for $14.99/month
- Student discount: 50% off with valid student ID
- Free trial: 7 days of premium features
- Support email: support@treslingo.com
- App Store ratings: 4.8/5 stars (iOS), 4.7/5 stars (Android)

Business Policies:
- Refund policy: Full refund within 7 days, prorated after
- Privacy policy: GDPR compliant, minimal data collection
- Terms of service: Standard app terms with educational focus
- Content policy: Family-friendly, cultural sensitivity
- Accessibility commitment: WCAG 2.1 AA compliance
`;

const KNOWLEDGE_CATEGORIES = `
Knowledge Document Distribution:
- 30% General app information and features
- 25% Troubleshooting guides (technical issues, account problems)
- 20% Company policies (billing, refunds, privacy, terms)
- 15% FAQ (common questions and quick answers)
- 10% Procedures (internal processes, escalation workflows)
`;

export async function generateKnowledgeDocuments(options: KnowledgeGenerationOptions = {}): Promise<GeneratedKnowledgeDocument[]> {
  const {
    category = 'all',
    count = 10,
    includeMetadata = true,
    detailLevel = 'detailed'
  } = options;

  console.log(`🧠 Generating ${count} knowledge documents for category: ${category}`);
  console.log(`📊 Detail level: ${detailLevel}`);

  const systemPrompt = `You are a technical writer creating comprehensive knowledge base documents for Treslingo.
${COMPANY_CONTEXT}

${KNOWLEDGE_CATEGORIES}

Create ${detailLevel} knowledge documents that include:
- Clear, actionable information
- Step-by-step procedures where appropriate
- Specific details about Treslingo features and policies
- Proper markdown formatting
- Helpful examples and scenarios
- Customer-friendly language
- Accurate technical information
- Cultural sensitivity for international users`;

  let userPrompt = '';
  
  if (category === 'all') {
    userPrompt = `Generate ${count} diverse knowledge base documents for Treslingo Spanish learning app, distributed across different categories.

Categories to include (distribute evenly):
- General: App features, learning system, account management
- FAQ: Quick answers to common user questions
- Troubleshooting: Step-by-step solutions for technical issues
- Policy: Company policies, terms, privacy, billing information
- Procedures: Internal workflows, escalation processes, customer service guidelines

Return a JSON object with a "documents" array containing ${count} knowledge document objects. Each document must have all fields: title, category, filename, content, tags, lastUpdated.

Make the content detailed and practical - real knowledge documents that would actually help solve customer problems.`;
  } else {
    // Category-specific prompts for focused generation
    const categoryPrompts = {
      'general': `Generate ${count} comprehensive GENERAL knowledge documents about Treslingo app features and functionality. Focus ONLY on general app information:
- How-to guides for app features (streaks, XP, gems, leaderboards)
- Learning system explanations (lesson types, difficulty progression)
- Account management procedures (profile, settings, family accounts)
- Feature tutorials and tips (offline mode, notifications, accessibility)

IMPORTANT: All documents must have category: "general". Do not create documents for other categories.`,

      'faq': `Generate ${count} comprehensive FAQ knowledge documents with quick answers to common Treslingo user questions. Focus ONLY on FAQ content:
- Common user questions and clear answers
- Feature explanations and clarifications
- Account and billing quick help
- Learning tips and guidance
- "How do I..." style questions

IMPORTANT: All documents must have category: "faq". Do not create documents for other categories.`,

      'troubleshooting': `Generate ${count} comprehensive TROUBLESHOOTING knowledge documents for technical issue resolution. Focus ONLY on troubleshooting content:
- App crashes and performance issues
- Audio/microphone problems in lessons
- Account sync and login issues
- Payment and subscription problems
- Progress not saving issues
- Speaking exercises not working

IMPORTANT: All documents must have category: "troubleshooting". Do not create documents for other categories.`,

      'policy': `Generate ${count} comprehensive POLICY knowledge documents about Treslingo company policies and terms. Focus ONLY on policy content:
- Privacy policy and data handling
- Terms of service and usage rules
- Refund and billing policies
- Content guidelines and community rules
- Legal information and compliance
- User rights and responsibilities

IMPORTANT: All documents must have category: "policy". Do not create documents for other categories.`,

      'procedures': `Generate ${count} comprehensive PROCEDURES knowledge documents for internal processes and workflows. Focus ONLY on procedures content:
- Customer service escalation procedures
- Account management workflows
- Technical support guidelines
- Content moderation processes
- Internal troubleshooting steps
- Support team protocols

IMPORTANT: All documents must have category: "procedures". Do not create documents for other categories.`
    };
    
    userPrompt = categoryPrompts[category] || categoryPrompts.general;
    userPrompt += `

Return a JSON object with a "documents" array containing ${count} knowledge document objects. Each document must have all fields: title, category, filename, content, tags, lastUpdated.

Make the content detailed and practical - real knowledge documents that would actually help solve customer problems.`;
  }

  const completion = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7, // Lower temperature for more consistent, factual content
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('No content generated');
  }

  try {
    const response = JSON.parse(content) as KnowledgeBatch;

    // Validate and clean up documents
    const documents = response.documents.map((doc, index) => {
      // Ensure filename has .md extension
      if (!doc.filename.endsWith('.md')) {
        doc.filename = doc.filename.replace(/\.[^/.]+$/, '') + '.md';
      }

      // Generate filename from title if missing
      if (!doc.filename || doc.filename === '.md') {
        doc.filename = doc.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') + '.md';
      }

      // Ensure all required fields are present
      doc.title = doc.title || `Knowledge Document ${index + 1}`;
      doc.category = doc.category || 'general';
      doc.content = doc.content || 'Content not available';
      doc.tags = doc.tags || ['treslingo', 'support'];
      doc.lastUpdated = doc.lastUpdated || new Date().toISOString();

      // Validate category
      const validCategories = ['policy', 'faq', 'troubleshooting', 'general', 'procedures'];
      if (!validCategories.includes(doc.category)) {
        doc.category = 'general';
      }

      // Ensure content is properly formatted as markdown
      if (!doc.content.startsWith('#')) {
        doc.content = `# ${doc.title}\n\n${doc.content}`;
      }

      // Add metadata to content if requested
      if (includeMetadata) {
        const metadata = `---
title: ${doc.title}
category: ${doc.category}
tags: [${doc.tags.join(', ')}]
last_updated: ${doc.lastUpdated}
---

`;
        doc.content = metadata + doc.content;
      }

      return doc;
    });

    return documents;
  } catch (error) {
    console.error('Failed to parse GPT response:', error, content);
    throw new Error('Invalid JSON response from GPT');
  }
}

export async function generateSingleDocument(
  category: 'policy' | 'faq' | 'troubleshooting' | 'general' | 'procedures',
  topic?: string,
  detailLevel: 'basic' | 'detailed' | 'comprehensive' = 'detailed'
): Promise<GeneratedKnowledgeDocument> {
  console.log(`📝 Generating single ${category} document${topic ? ` about ${topic}` : ''}`);
  
  const options: KnowledgeGenerationOptions = {
    category,
    count: 1,
    detailLevel,
    includeMetadata: true
  };

  let topicPrompt = '';
  if (topic) {
    topicPrompt = ` specifically about "${topic}"`;
  }

  // Override the user prompt for single document generation
  const systemPrompt = `You are a technical writer creating a comprehensive knowledge base document for Treslingo.
${COMPANY_CONTEXT}

Create a ${detailLevel} ${category} document${topicPrompt} that includes:
- Clear, actionable information
- Step-by-step procedures where appropriate
- Specific details about Treslingo features and policies
- Proper markdown formatting
- Helpful examples and scenarios
- Customer-friendly language
- Accurate technical information`;

  const userPrompt = `Generate 1 comprehensive ${category} knowledge document${topicPrompt} for Treslingo Spanish learning app.

The document should be thorough and helpful for both customers and support staff.

Return a JSON object with a "documents" array containing 1 knowledge document object with all fields: title, category, filename, content, tags, lastUpdated.

Make the content detailed and practical - a real knowledge document that would actually help solve customer problems.`;

  const completion = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('No content generated');
  }

  try {
    const response = JSON.parse(content) as KnowledgeBatch;
    const documents = response.documents.map(doc => {
      // Same validation as batch generation
      if (!doc.filename.endsWith('.md')) {
        doc.filename = doc.filename.replace(/\.[^/.]+$/, '') + '.md';
      }

      if (!doc.filename || doc.filename === '.md') {
        doc.filename = doc.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') + '.md';
      }

      doc.title = doc.title || `${category} Document`;
      doc.category = doc.category || category;
      doc.content = doc.content || 'Content not available';
      doc.tags = doc.tags || ['treslingo', 'support', category];
      doc.lastUpdated = doc.lastUpdated || new Date().toISOString();

      if (!doc.content.startsWith('#')) {
        doc.content = `# ${doc.title}\n\n${doc.content}`;
      }

      // Add metadata
      const metadata = `---
title: ${doc.title}
category: ${doc.category}
tags: [${doc.tags.join(', ')}]
last_updated: ${doc.lastUpdated}
---

`;
      doc.content = metadata + doc.content;

      return doc;
    });

    return documents[0];
  } catch (error) {
    console.error('Failed to parse GPT response:', error, content);
    throw new Error('Invalid JSON response from GPT');
  }
}

export async function generateKnowledgeByType(
  types: ('policy' | 'faq' | 'troubleshooting' | 'general' | 'procedures')[],
  documentsPerType: number = 2,
  detailLevel: 'basic' | 'detailed' | 'comprehensive' = 'detailed'
): Promise<GeneratedKnowledgeDocument[]> {
  console.log(`📚 Generating ${documentsPerType} documents for each type: ${types.join(', ')}`);
  console.log(`📊 Detail level: ${detailLevel}`);

  const allDocuments: GeneratedKnowledgeDocument[] = [];

  for (const type of types) {
    console.log(`🔄 Generating ${type} documents...`);
    const documents = await generateKnowledgeDocuments({
      category: type,
      count: documentsPerType,
      detailLevel: detailLevel,
      includeMetadata: true
    });
    allDocuments.push(...documents);

    // Add delay between batches to avoid rate limiting
    if (types.indexOf(type) < types.length - 1) {
      console.log(`⏳ Waiting 2 seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`✅ Generated ${allDocuments.length} total knowledge documents`);
  return allDocuments;
} 