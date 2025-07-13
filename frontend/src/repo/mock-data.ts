import type { Thread, ThreadDetail, Draft, AgentActivityDetail, ThreadCounts, Email, AgentAction } from '../types/api';

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Mary'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'business.net'];

const subjects = [
  'Unable to access my account',
  'Billing question about recent charge',
  'Feature request: Dark mode',
  'Great job with the recent update!',
  'Bug report: Application crashes on startup',
  'How do I export my data?',
  'Password reset not working',
  'Integration with third-party service',
  'Performance issues with large datasets',
  'Thank you for the excellent support!'
];

const emailBodies = [
  'I\'ve been trying to log into my account for the past hour, but I keep getting an error message. Can you help me resolve this issue?',
  'I noticed a charge on my credit card that I don\'t recognize. Could you please provide more details about this transaction?',
  'Your product is great, but it would be even better with a dark mode option. Are there any plans to add this feature?',
  'Just wanted to say that the recent update has made a huge difference in my workflow. Keep up the excellent work!',
  'The application crashes every time I try to open a specific file. I\'ve attached the error log for your reference.',
  'I need to export all my data for a presentation. What\'s the best way to do this?',
  'I requested a password reset email but haven\'t received it yet. I\'ve checked my spam folder as well.',
  'We\'re looking to integrate your service with our CRM system. Do you have an API available?',
  'The application becomes very slow when working with datasets larger than 10,000 rows. Is this a known issue?',
  'Your support team went above and beyond to help me. I really appreciate the excellent service!'
];

const agentAnalyses = [
  'Customer is experiencing authentication issues. This appears to be a common login problem that might be resolved by clearing browser cache or resetting password.',
  'Customer is inquiring about a billing charge. Need to verify the transaction details and provide clarification.',
  'Feature request for dark mode. This is a popular request that we should consider for future updates.',
  'Positive feedback from satisfied customer. Should respond with appreciation and encourage continued engagement.',
  'Technical issue reported. Customer is experiencing application crashes that need immediate attention.',
  'Customer needs help with data export functionality. Should provide step-by-step instructions.',
  'Password reset email delivery issue. Need to check email service and provide alternative reset method.',
  'Integration request from potential enterprise customer. Should provide API documentation and support.',
  'Performance issue with large datasets. Known limitation that engineering team is working on.',
  'Positive feedback about support experience. Should thank customer and maintain relationship.'
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function generateTimestamp(daysAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - Math.floor(Math.random() * 24));
  return date.toISOString();
}

function generateCustomerName(): { name: string; email: string } {
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  const domain = randomElement(domains);
  return {
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`
  };
}

export function generateMockThread(index: number): Thread {
  const customer = generateCustomerName();
  const daysAgo = Math.floor(Math.random() * 7);
  const isUnread = Math.random() > 0.7;
  const statuses = ['open', 'closed', 'pending'];
  const allTags = ['urgent', 'bug', 'feature-request', 'billing', 'positive-feedback'];
  
  const tags: string[] = [];
  if (Math.random() > 0.7) tags.push(randomElement(allTags));
  if (Math.random() > 0.8) tags.push('urgent');

  return {
    id: generateId(),
    subject: subjects[index % subjects.length],
    snippet: emailBodies[index % emailBodies.length].substring(0, 100) + '...',
    customer_name: customer.name,
    customer_email: customer.email,
    timestamp: generateTimestamp(daysAgo),
    is_unread: isUnread,
    status: randomElement(statuses),
    tags,
    worker_active: Math.random() > 0.8,
    userActionRequired: Math.random() > 0.85
  };
}

export function generateMockThreadDetail(thread: Thread): ThreadDetail {
  const emails: Email[] = [];
  const actions: AgentAction[] = [];
  
  // Generate initial customer email
  emails.push({
    id: generateId(),
    from_name: thread.customer_name,
    from_email: thread.customer_email,
    content: emailBodies[Math.floor(Math.random() * emailBodies.length)],
    timestamp: thread.timestamp,
    is_support_reply: false
  });

  // Generate agent actions
  actions.push({
    id: generateId(),
    type: 'analyze',
    title: 'Analyzed email content',
    description: 'Performed sentiment analysis and categorization',
    timestamp: new Date(new Date(thread.timestamp).getTime() + 60000).toISOString(),
    status: 'completed'
  });

  actions.push({
    id: generateId(),
    type: 'search',
    title: 'Searched knowledge base',
    description: 'Found 3 relevant articles',
    timestamp: new Date(new Date(thread.timestamp).getTime() + 120000).toISOString(),
    status: 'completed',
    result: { articles_found: 3 }
  });

  actions.push({
    id: generateId(),
    type: 'draft',
    title: 'Generated response draft',
    description: 'Created initial response based on knowledge base',
    timestamp: new Date(new Date(thread.timestamp).getTime() + 180000).toISOString(),
    status: 'completed'
  });

  // Maybe add a support reply
  if (Math.random() > 0.5) {
    emails.push({
      id: generateId(),
      from_name: 'Support Team',
      from_email: 'support@proresponse.ai',
      content: 'Thank you for reaching out. ' + randomElement(agentAnalyses),
      timestamp: new Date(new Date(thread.timestamp).getTime() + 3600000).toISOString(),
      is_support_reply: true
    });

    // Maybe add customer follow-up
    if (Math.random() > 0.5) {
      emails.push({
        id: generateId(),
        from_name: thread.customer_name,
        from_email: thread.customer_email,
        content: 'Thanks for the quick response! That solved my issue.',
        timestamp: new Date(new Date(thread.timestamp).getTime() + 7200000).toISOString(),
        is_support_reply: false
      });
    }
  }

  return {
    id: thread.id,
    subject: thread.subject,
    status: thread.status,
    tags: thread.tags,
    customer: {
      name: thread.customer_name,
      email: thread.customer_email
    },
    emails,
    internal_notes: [
      // Add some sample internal notes for testing
      {
        id: `note-${thread.id}-1`,
        content: `Customer seems frustrated. This is their second issue this week. Should consider escalating or providing additional support.`,
        is_pinned: false,
        created_at: new Date(new Date(thread.timestamp).getTime() - 1800000).toISOString(), // 30 min before first email
        updated_at: new Date(new Date(thread.timestamp).getTime() - 1800000).toISOString(),
        author: {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah@company.com'
        },
        can_edit: false
      },
      {
        id: `note-${thread.id}-2`,
        content: `📌 IMPORTANT: Customer has premium support plan. Response time SLA is 2 hours.`,
        is_pinned: true,
        created_at: new Date(new Date(thread.timestamp).getTime() + 900000).toISOString(), // 15 min after first email
        updated_at: new Date(new Date(thread.timestamp).getTime() + 900000).toISOString(),
        author: {
          id: '2',
          name: 'Mike Chen',
          email: 'mike@company.com'
        },
        can_edit: true
      }
    ],
    agent_activity: {
      analysis: randomElement(agentAnalyses),
      draft_response: `Dear ${thread.customer_name},\n\nThank you for reaching out. ${randomElement(agentAnalyses)}\n\nBest regards,\nSupport Team`,
      actions
    }
  };
}

export function generateMockDraft(): Draft {
  return {
    content: `Dear Customer,\n\n${randomElement(agentAnalyses)}\n\nPlease let me know if you need any further assistance.\n\nBest regards,\nSupport Team`,
    citations: [],
    last_updated: generateTimestamp(0),
    is_agent_generated: true
  };
}

export function generateMockAgentActivity(): AgentActivityDetail {
  const actions: AgentAction[] = [
    {
      id: generateId(),
      type: 'analyze',
      title: 'Email Analysis',
      description: 'Analyzed email content and extracted key information',
      timestamp: generateTimestamp(0),
      status: 'completed',
      result: { sentiment: 'neutral', category: 'technical-support' }
    },
    {
      id: generateId(),
      type: 'search',
      title: 'Knowledge Base Search',
      description: 'Searched for relevant documentation',
      timestamp: generateTimestamp(0),
      status: 'completed',
      result: { documents_found: 5, relevance_score: 0.85 }
    },
    {
      id: generateId(),
      type: 'generate',
      title: 'Response Generation',
      description: 'Generated draft response using AI',
      timestamp: generateTimestamp(0),
      status: 'completed'
    }
  ];

  return {
    analysis: randomElement(agentAnalyses),
    suggested_response: generateMockDraft().content,
    confidence_score: 0.75 + Math.random() * 0.2,
    actions,
    knowledge_used: [
      { source: 'FAQ: Account Access Issues', relevance: 0.9 },
      { source: 'Troubleshooting Guide: Login Problems', relevance: 0.85 },
      { source: 'Security Best Practices', relevance: 0.7 }
    ]
  };
}

export function generateMockThreadCounts(threads: Thread[]): ThreadCounts {
  return {
    all: threads.length,
    unread: threads.filter(t => t.is_unread).length,
    flagged: threads.filter(t => t.tags.includes('flagged')).length,
    urgent: threads.filter(t => t.tags.includes('urgent')).length,
    awaiting_customer: threads.filter(t => t.status === 'pending').length,
    closed: threads.filter(t => t.status === 'closed').length
  };
}

// Generate a set of mock threads
export const mockThreads: Thread[] = Array.from({ length: 20 }, (_, i) => generateMockThread(i));