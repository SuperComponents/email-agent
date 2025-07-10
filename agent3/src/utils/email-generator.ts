import { randomUUID } from 'crypto';

export interface EmailTemplate {
  subject: string;
  body: string;
  type: 'spam' | 'support' | 'sales' | 'legal' | 'billing' | 'technical';
}

const emailTemplates: EmailTemplate[] = [
  // Spam emails
  {
    type: 'spam',
    subject: 'Congratulations! You\'ve won $1,000,000!!!',
    body: `Dear Winner,

We are pleased to inform you that you have won our international lottery!

To claim your prize of $1,000,000, please click here immediately: http://totally-not-a-scam.com

You must act within 24 hours or forfeit your winnings!

Best regards,
International Lottery Commission`,
  },
  {
    type: 'spam',
    subject: 'Hot singles in your area want to meet!',
    body: `Hi there!

There are 47 hot singles in your area waiting to chat with you!

Click here to meet them now: http://definitely-real-dating.com

No credit card required!*
*Terms and conditions apply`,
  },
  {
    type: 'spam',
    subject: 'Lose 30 pounds in 30 days GUARANTEED',
    body: `Amazing weight loss breakthrough!

Doctors hate this one simple trick that melts fat away!

Order now and get 50% off: http://miracle-diet-pills.com

Limited time offer - Act NOW!`,
  },
  
  // Support emails
  {
    type: 'support',
    subject: 'Unable to log into my account',
    body: `Hello,

I\'m having trouble logging into my account. I\'ve tried resetting my password three times but I\'m not receiving the reset email.

My username is john.doe@email.com

Can you please help me regain access to my account?

Thank you,
John Doe`,
  },
  {
    type: 'support',
    subject: 'Order #12345 hasn\'t arrived',
    body: `Hi Support Team,

I placed an order 10 days ago (Order #12345) and it still hasn\'t arrived. The tracking shows it was shipped but there have been no updates for a week.

Can you please check on this for me? I need these items for an event this weekend.

Thanks,
Sarah Johnson`,
  },
  
  // Sales emails
  {
    type: 'sales',
    subject: 'Interested in Enterprise Plan',
    body: `Hello Sales Team,

We\'re evaluating your product for our company (500+ employees) and are interested in learning more about your Enterprise plan.

Could we schedule a call this week to discuss:
- Pricing for 500 users
- Custom integrations
- Security features
- Implementation timeline

Best regards,
Michael Chen
CTO, TechCorp Inc.`,
  },
  
  // Legal emails
  {
    type: 'legal',
    subject: 'DMCA Takedown Notice',
    body: `To Whom It May Concern,

This is a formal DMCA takedown notice. We have identified copyrighted content on your platform that infringes on our client\'s intellectual property rights.

The infringing content can be found at: [URL]

Please remove this content within 48 hours to avoid further legal action.

Sincerely,
Legal Department
Smith & Associates Law Firm`,
  },
  
  // Billing emails
  {
    type: 'billing',
    subject: 'Incorrect charge on my account',
    body: `Hello Billing Department,

I noticed an incorrect charge of $299.99 on my account dated March 15th. I only signed up for the Basic plan which should be $29.99/month.

Please correct this error and refund the difference.

Account ID: ACC-789456
Invoice Number: INV-2024-0315

Thank you,
Emma Wilson`,
  },
  
  // Technical emails
  {
    type: 'technical',
    subject: 'API returning 500 errors',
    body: `Hi Tech Support,

We\'re experiencing intermittent 500 errors when calling the /api/v2/users endpoint. This started happening around 2 hours ago.

Error details:
- Endpoint: POST /api/v2/users
- Response: 500 Internal Server Error
- Frequency: ~30% of requests
- API Key: sk_live_abc123...

This is affecting our production environment. Please investigate urgently.

Thanks,
David Park
Senior Developer`,
  },
];

export function generateEmail(type?: EmailTemplate['type']): EmailTemplate {
  if (type) {
    const filtered = emailTemplates.filter(t => t.type === type);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
  return emailTemplates[Math.floor(Math.random() * emailTemplates.length)];
}

export function generateEmailThread(count: number = 3): Array<EmailTemplate & { from: string; to: string }> {
  const supportEmail = 'support@company.com';
  const customerEmail = `customer${Math.floor(Math.random() * 1000)}@email.com`;
  
  const thread: Array<EmailTemplate & { from: string; to: string }> = [];
  
  // First email from customer
  const firstEmail = generateEmail('support');
  thread.push({
    ...firstEmail,
    from: customerEmail,
    to: supportEmail,
  });
  
  // Alternating responses
  for (let i = 1; i < count; i++) {
    const isFromCustomer = i % 2 === 0;
    thread.push({
      subject: `Re: ${firstEmail.subject}`,
      body: isFromCustomer 
        ? 'Thanks for your response. However, I still have the same issue. Can you please escalate this?'
        : 'I understand your concern. Let me look into this further for you. Can you provide your account details?',
      type: 'support',
      from: isFromCustomer ? customerEmail : supportEmail,
      to: isFromCustomer ? supportEmail : customerEmail,
    });
  }
  
  return thread;
}

export function createEmailRecord(template: EmailTemplate & { from: string; to: string }, threadId: number) {
  return {
    thread_id: threadId,
    from_email: template.from,
    to_emails: [template.to],
    subject: template.subject,
    body_text: template.body,
    direction: template.to === 'support@company.com' ? 'inbound' as const : 'outbound' as const,
    sent_at: new Date(),
  };
}