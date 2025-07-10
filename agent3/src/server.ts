import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { db } from './db/db';
import { emails, threads } from './db/newschema';
import { eq } from 'drizzle-orm';
import { processEmail } from './agents/email-agent';
import { randomUUID } from 'crypto';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ message: 'Email Smart API - AI-powered email processing' });
});

// Process a single email
app.post('/process-email', async (c) => {
  const { id, from, to, subject, body, threadId } = await c.req.json();
  
  const email = {
    id: id || Math.floor(Math.random() * 1000000), // Use provided ID or generate a random number
    from_email: from,
    to_emails: to,
    subject,
    body_text: body,
    created_at: new Date(),
  };

  // Process with agent
  const result = await processEmail(email, threadId);
  
  return c.json(result);
});

// Get email threads
app.get('/threads', async (c) => {
  const threadList = await db.select().from(threads);
  return c.json(threadList);
});

// Get emails by thread
app.get('/threads/:threadId/emails', async (c) => {
  const threadId = c.req.param('threadId');
  const threadEmails = await db.select().from(emails).where(eq(emails.thread_id, parseInt(threadId)));
  return c.json(threadEmails);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});