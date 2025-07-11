import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '../config/env.js';


const openai = new OpenAI({ 
  apiKey: OPENAI_API_KEY,
});


export interface GeneratedEmail {
  subject: string;
  body: string;
  senderName: string;
  senderEmail: string;
  isReply?: boolean;
  originalSubject?: string;
}


export interface EmailBatch {
  emails: GeneratedEmail[];
}


const COMPANY_CONTEXT = `
Treslingo is a popular mobile language learning app that teaches Spanish through gamified lessons, similar to Duolingo but with a friendly cat mascot.

App Features:
- Free tier: Basic lessons, limited hearts, ads
- Premium tier ($9.99/month): No ads, unlimited hearts, offline mode
- Daily streaks with streak freezes available
- XP points, gems, leaderboards, and achievements
- Lesson types: vocabulary, grammar, speaking, listening comprehension
- Social features: friends, leaderboards, family accounts
- Mobile-only app (iOS and Android)

Common user issues:
- Lost streaks due to timezone changes or technical glitches
- Billing and subscription problems (charges, cancellations, refunds)
- Audio not working in speaking/listening exercises
- Progress not saving or syncing properly
- Notification issues (too many reminders, not receiving reminders)
- Account recovery problems (forgotten passwords, email changes)
- Difficulty level complaints (too easy/too hard)
- Legal complaints about copyrighted text appearing in lessons
- App crashes or freezing during lessons

Account format: TR-XXXXX (5 digits)
Premium subscription: Monthly auto-renewal
Support email: support@treslingo.com
App Store ratings: 4.8/5 stars
`;


const EMAIL_CATEGORIES = `
Email distribution (approximate):
- 35% Learning support (lost streaks, progress issues, difficulty level)
- 25% Technical issues (app crashes, audio problems, syncing issues)
- 20% Billing/subscription support (charges, cancellations, premium features)
- 10% Account issues (password resets, email changes, family accounts)
- 10% Edge cases (legal complaints about copyrighted content, feature requests, angry users)
`;


export async function generateEmailBatch(count: number = 20): Promise<GeneratedEmail[]> {
  const systemPrompt = `You are generating realistic customer support emails for Treslingo.
${COMPANY_CONTEXT}

${EMAIL_CATEGORIES}

Generate emails that feel authentic with:
- Natural language (including occasional typos for some customers)
- Realistic details (account numbers, streak counts, lesson progress)
- Appropriate tone for the customer type (frustrated learners, excited students, confused parents)
- Varied writing styles and education levels
- Different age groups (kids, teens, adults, seniors)
- International users with varying English proficiency
- Make emails longer and more detailed - real customers often explain their situation in detail`;


  const userPrompt = `Generate ${count} diverse customer support emails for Treslingo Spanish learning app. Each should be completely different in topic, tone, and style. Make them feel like real emails from real people with real problems or questions about learning Spanish.

Return a JSON object with an "emails" array containing ${count} email objects. Each email must have all fields: subject, body, senderName, senderEmail.`;


  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.95,
    response_format: { type: "json_object" },
    // No max_tokens limit - let it generate full emails
  });


  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('No content generated');
  }


  try {
    const response = JSON.parse(content) as EmailBatch;


    // Validate and clean up emails
    const emails = response.emails.map(email => {
      // Extract email from body if missing
      if (!email.senderEmail && email.body) {
        const emailMatch = email.body.match(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/);
        if (emailMatch) {
          email.senderEmail = emailMatch[0];
        }
      }


      // Extract name from body if missing
      if (!email.senderName && email.body) {
        const lines = email.body.split('\n');
        // Look for name in signature (usually 2-3 lines from end)
        for (let i = lines.length - 1; i >= Math.max(0, lines.length - 4); i--) {
          const line = lines[i].trim();
          // Skip empty lines and email addresses
          if (line && !line.includes('@') && !line.match(/^(Best|Regards|Thanks|Sincerely|Cheers)/i)) {
            email.senderName = line;
            break;
          }
        }
      }


      // Ensure all fields are present
      if (!email.subject || !email.body || !email.senderName || !email.senderEmail) {
        // Fill in missing fields
        email.subject = email.subject || 'No subject';
        email.body = email.body || 'No content';
        email.senderName = email.senderName || 'Unknown Customer';
        email.senderEmail = email.senderEmail || `customer${Math.floor(Math.random() * 10000)}@email.com`;
      }


      // Ensure customer emails don't use company domain
      if (email.senderEmail.includes('@treslingo.com')) {
        email.senderEmail = email.senderEmail.replace('@treslingo.com', '@gmail.com');
      }


      return email;
    });


    return emails;
  } catch (error) {
    console.error('Failed to parse GPT response:', error, content);
    throw new Error('Invalid JSON response from GPT');
  }
}


export async function generateEmail(
  _category?: string,
  _isReply: boolean = false,
  _previousContext?: string
): Promise<GeneratedEmail> {
  // For single email generation, use the batch function and return first email
  const emails = await generateEmailBatch(1);
  return emails[0];
}


export async function generateEmailThread(
  threadLength: number = 2,
  category?: string
): Promise<GeneratedEmail[]> {
  const emails: GeneratedEmail[] = [];


  // Generate initial email
  const firstEmail = await generateEmail(category);
  emails.push(firstEmail);


  // Generate replies
  for (let i = 1; i < threadLength; i++) {
    const context = emails.map((e, idx) => 
      `Email ${idx + 1}: Subject: ${e.subject}\nFrom: ${e.senderName}\nBody preview: ${e.body.substring(0, 100)}...`
    ).join('\n\n');


    const reply = await generateEmail(category, true, context);
    reply.isReply = true;
    reply.originalSubject = firstEmail.subject;
    emails.push(reply);


    // Add delay to avoid rate limiting
    // await new Promise(resolve => setTimeout(resolve, 1000));
  }


  return emails;
}