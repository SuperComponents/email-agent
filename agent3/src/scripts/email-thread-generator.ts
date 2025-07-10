import { OpenAI } from 'openai';
import { env } from '../config/environment';

const openai = new OpenAI({ 
  apiKey: env.OPENAI_API_KEY,
});

export interface ThreadEmail {
  subject: string;
  body: string;
  senderName: string;
  senderEmail: string;
  isCustomer: boolean;
}

export interface EmailThread {
  emails: ThreadEmail[];
}

const COMPANY_CONTEXT = `
GauntletAIron is a premium armor manufacturer specializing in armored gloves and protective gear.

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

Order format: GA-XXXXX (5 digits)
Warranty: 2 years standard, 5 years premium
Support email: support@gauntletairon.com
`;

const THREAD_CATEGORIES = [
  "Sizing issue - wrong size ordered, needs exchange",
  "Damaged product received - tear, scratch, or defect",
  "Order delay inquiry - checking on shipment status",
  "Technical support - maintenance, care instructions",
  "Warranty claim - product failure within warranty period",
  "Custom order request - special requirements or modifications",
  "Bulk/B2B inquiry - corporate or group purchase",
  "Complaint escalation - unhappy customer getting frustrated",
  "Product recommendation - needs help choosing right product",
  "Return/refund request - dissatisfied with purchase"
];

export async function generateCoherentThread(length: number = 3): Promise<ThreadEmail[]> {
  // Pick a random category for this thread
  const category = THREAD_CATEGORIES[Math.floor(Math.random() * THREAD_CATEGORIES.length)];
  
  const systemPrompt = `You are generating a realistic customer support email thread for GauntletAIron.
${COMPANY_CONTEXT}

You must generate a coherent conversation thread about: ${category}

Rules:
1. The SAME customer throughout the entire thread
2. Each email should be a logical response to the previous one
3. Alternate between customer emails and support agent responses
4. The conversation should progress naturally
5. Support agents should have different names (Sarah, Mike, Jennifer, etc.)
6. Keep the original issue/topic consistent throughout
7. Make it feel like a real conversation with natural progression`;

  const userPrompt = `Generate a ${length}-email thread about "${category}".

The thread should have:
- Email 1: Customer's initial inquiry/complaint
- Email 2: Support agent's response
- Email 3+: Continued back-and-forth conversation

Return a JSON object with an "emails" array containing ${length} email objects. Each email must have:
- subject: The email subject (use "Re: [original subject]" for replies)
- body: The email body
- senderName: Full name of sender
- senderEmail: Email address
- isCustomer: true for customer, false for support agent

The customer's name and email should remain the same throughout the thread.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.9,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('No content generated');
  }

  try {
    const response = JSON.parse(content) as EmailThread;
    
    // Validate emails
    const emails = response.emails.map((email, index) => {
      // Ensure all fields are present
      if (!email.subject || !email.body || !email.senderName || !email.senderEmail) {
        throw new Error(`Missing fields in email ${index + 1}`);
      }
      
      // Ensure alternating pattern (customer first)
      email.isCustomer = index % 2 === 0;
      
      // Fix support emails to use company domain
      if (!email.isCustomer && !email.senderEmail.includes('@gauntletairon.com')) {
        email.senderEmail = 'support@gauntletairon.com';
      }
      
      return email;
    });
    
    return emails;
  } catch (error) {
    console.error('Failed to parse GPT response:', content);
    throw new Error('Invalid JSON response from GPT');
  }
}

// Generate a batch of coherent threads
export async function generateCoherentThreadBatch(
  threadCount: number = 5,
  minLength: number = 2,
  maxLength: number = 5
): Promise<ThreadEmail[][]> {
  const threads: ThreadEmail[][] = [];
  
  for (let i = 0; i < threadCount; i++) {
    const length = minLength + Math.floor(Math.random() * (maxLength - minLength + 1));
    console.log(`  Generating thread ${i + 1}/${threadCount} with ${length} emails...`);
    
    try {
      const thread = await generateCoherentThread(length);
      threads.push(thread);
      
      // Rate limiting
      if (i < threadCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error(`  Failed to generate thread ${i + 1}:`, error);
    }
  }
  
  return threads;
}