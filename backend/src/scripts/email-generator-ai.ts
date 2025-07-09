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
GauntletAIron is a premium armor manufacturer specializing in armored gloves and protective gear for military, law enforcement, industrial workers, and collectors.

Products:
- TacticalPro Series ($450-$850): Military/law enforcement grade with kevlar lining
- DragonScale Gauntlets ($1200-$2500): Premium leather with titanium plating, handcrafted
- WorkForce Heavy ($250-$450): Industrial protection, heat resistant
- CyberKnight Collection ($800-$1500): Futuristic design for collectors, LED accents
- RoadGuard Series ($350-$650): Motorcycle protection with impact absorption

Common issues:
- Sizing problems (gloves run small)
- Delivery delays (custom orders take 4-6 weeks)
- Break-in period for leather products
- Maintenance questions (leather care, metal polishing)
- Custom fitting services available

Order format: GA-XXXXX (5 digits)
Warranty: 2 years standard, 5 years premium
Support email: support@gauntletairon.com
Phone: 1-800-GAUNTLET
`;

const EMAIL_CATEGORIES = `
Email distribution (approximate):
- 40% Normal support
- 20% Technical issues 
- 15% Complaints
- 10% Sales inquiries 
- 15% Edge cases (legal threats, spam, angry customers, partnerships, media)
`;

export async function generateEmailBatch(count: number = 20): Promise<GeneratedEmail[]> {
  const systemPrompt = `You are generating realistic customer support emails for GauntletAIron.
${COMPANY_CONTEXT}

${EMAIL_CATEGORIES}

Generate emails that feel authentic with:
- Natural language (including occasional typos for some customers)
- Realistic details (order numbers, dates, product names)
- Appropriate tone for the customer type
- Varied writing styles and education levels
- Make emails longer and more detailed - real customers often explain their situation in detail`;

  const userPrompt = `Generate ${count} diverse customer support emails. Each should be completely different in topic, tone, and style. Make them feel like real emails from real people with real problems or questions.

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
      if (email.senderEmail.includes('@gauntletairon.com')) {
        email.senderEmail = email.senderEmail.replace('@gauntletairon.com', '@gmail.com');
      }
      
      return email;
    });
    
    return emails;
  } catch (error) {
    console.error('Failed to parse GPT response:', content);
    throw new Error('Invalid JSON response from GPT');
  }
}

export async function generateEmail(
  category?: string,
  isReply: boolean = false,
  previousContext?: string
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