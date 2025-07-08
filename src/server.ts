import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { db } from './db';
import { emails, emailThreads, emailTags } from './db/schema';
import { eq } from 'drizzle-orm';
import { emailAgent } from './agents/email-agent';
import { randomUUID } from 'crypto';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ message: 'Email Smart API - AI-powered email processing' });
});

// Process a single email
app.post('/process-email', async (c) => {
  const { from, to, subject, body, threadId } = await c.req.json();
  
  const emailId = randomUUID();
  const email = {
    id: emailId,
    from,
    to,
    subject,
    body,
    timestamp: new Date(),
  };

  // Process with agent
  const result = await emailAgent.processEmail(email, threadId);
  
  return c.json(result);
});

// Get email threads
app.get('/threads', async (c) => {
  const threads = await db.select().from(emailThreads);
  return c.json(threads);
});

// Get emails by thread
app.get('/threads/:threadId/emails', async (c) => {
  const threadId = c.req.param('threadId');
  const threadEmails = await db.select().from(emails).where(eq(emails.threadId, threadId));
  return c.json(threadEmails);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});