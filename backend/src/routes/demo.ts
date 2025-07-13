
import { Hono } from 'hono';
import { db } from '../database/db.js';
import { emails, threads } from '../database/schema.js';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../config/env.js';
import { processEmail } from 'agent3';
import {
  startEmailSimulation,
  stopEmailSimulation,
  getSimulationStatus,
  generateSingleEmail,
} from '../services/email-simulation.js';

const app = new Hono();
app.use(authMiddleware);

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// POST /api/threads/:threadId/demo-customer-response
app.post('/:threadId/demo-customer-response', async c => {
  try {
    const threadId = parseInt(c.req.param('threadId'));

    if (isNaN(threadId)) {
      return c.json({ error: 'Invalid thread ID' }, 400);
    }

    // Fetch the thread
    const [thread] = await db.select().from(threads).where(eq(threads.id, threadId)).limit(1);

    if (!thread) {
      return c.json({ error: 'Thread not found' }, 404);
    }

    // Fetch all emails in the thread, ordered by created_at
    const threadEmails = await db
      .select()
      .from(emails)
      .where(eq(emails.thread_id, threadId))
      .orderBy(emails.created_at);

    if (threadEmails.length === 0) {
      return c.json({ error: 'No emails found in thread' }, 404);
    }

    // Get the original customer email (first email in thread)
    const originalCustomerEmail = threadEmails[0];
    const customerEmailAddress = originalCustomerEmail.from_email;

    // Build conversation context for OpenAI
    const conversationContext = threadEmails
      .map(email => {
        const role = email.direction === 'inbound' ? 'Customer' : 'Support';
        return `${role} (${email.from_email}): ${email.body_text || ''}`;
      })
      .join('\n\n---\n\n');

    // Generate a contextual customer response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are simulating a customer's follow-up email in an ongoing support conversation. 
          The customer originally sent an email about an issue, support responded, and now the customer is following up.
          
          Generate a realistic customer follow-up email that:
          - Acknowledges the support response
          - Either asks a clarifying question, provides requested information, or expresses satisfaction/dissatisfaction
          - Maintains the same tone and style as the original customer email
          - Is brief and realistic (2-4 sentences typical for customer emails)
          - Sometimes includes a thank you or shows frustration if the issue isn't resolved
          
          Return ONLY the email body text, no subject line or signatures.`,
        },
        {
          role: 'user',
          content: `Here's the conversation so far:\n\n${conversationContext}\n\nGenerate the customer's next response.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const generatedContent =
      completion.choices[0].message.content || 'Thank you for your response.';

    // Find who the customer was emailing (support email)
    const supportEmailAddress =
      threadEmails.find(e => e.direction === 'outbound')?.from_email ||
      (originalCustomerEmail.to_emails as string[])[0] ||
      'support@company.com';

    // Create the new customer email
    const [newEmail] = await db
      .insert(emails)
      .values({
        thread_id: threadId,
        from_email: customerEmailAddress,
        to_emails: [supportEmailAddress],
        cc_emails: originalCustomerEmail.cc_emails,
        subject: `Re: ${thread.subject}`,
        body_text: generatedContent,
        body_html: `<p>${generatedContent.replace(/\n/g, '<br>')}</p>`,
        direction: 'inbound' as const,
        is_draft: false,
        sent_at: new Date(),
      })
      .returning();

    // Update thread's last activity
    await db
      .update(threads)
      .set({
        last_activity_at: new Date(),
        status: 'needs_attention' as const,
      })
      .where(eq(threads.id, threadId));


    const logger = (message: unknown) => console.log(message);
    await processEmail(threadId, logger, 'please process the latest customer response');

    return c.json({
      success: true,
      email: newEmail,
      message: 'Demo customer response generated successfully',
    });
  } catch (error) {
    console.error('Error generating demo customer response:', error);
    return c.json(
      {
        error: 'Failed to generate demo customer response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});

// POST /api/demo/start-email-simulation - Start scenario-based email generation
app.post('/start-email-simulation', async c => {
  try {
    const intervalMs = 5000; // Default 1.5 minutes

    const result = await startEmailSimulation(intervalMs);

    if (result.success) {
      return c.json({
        success: true,
        message: result.message,
        intervalMs: result.intervalMs,
        scenariosCount: result.scenariosCount,
      });
    } else {
      return c.json({ success: false, error: result.message }, 400);
    }
  } catch (error) {
    console.error('Error starting email simulation:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start simulation',
      },
      500,
    );
  }
});

// POST /api/demo/stop-email-simulation - Stop email generation
app.post('/stop-email-simulation', c => {
  try {
    const result = stopEmailSimulation();

    if (result.success) {
      return c.json({
        success: true,
        message: result.message,
        totalEmailsGenerated: result.totalEmailsGenerated,
      });
    } else {
      return c.json({ success: false, error: result.message }, 400);
    }
  } catch (error) {
    console.error('Error stopping email simulation:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to stop simulation',
      },
      500,
    );
  }
});

// GET /api/demo/simulation-status - Check simulation status
app.get('/simulation-status', c => {
  try {
    const status = getSimulationStatus();

    return c.json({
      success: true,
      status: {
        isRunning: status.isRunning,
        emailsGenerated: status.emailsGenerated,
        startTime: status.startTime,
      },
    });
  } catch (error) {
    console.error('Error getting simulation status:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get status',
      },
      500,
    );
  }
});

// POST /api/demo/generate-scenario-email - Generate single email from scenario
app.post('/generate-scenario-email', async c => {
  try {
    const result = await generateSingleEmail();

    if (result.success) {
      return c.json({
        success: true,
        message: result.message,
        thread: {
          id: result.thread!.id.toString(),
          subject: result.thread!.subject,
        },
        email: {
          id: result.email!.id.toString(),
          from_email: result.email!.from_email,
          subject: result.email!.subject,
          body_text: result.email!.body_text,
        },
        scenario: {
          id: result.scenario!.id,
          title: result.scenario!.title,
          category: result.scenario!.category,
          severity: result.scenario!.severity,
        },
      });
    } else {
      return c.json({ success: false, error: result.message }, 400);
    }
  } catch (error) {
    console.error('Error generating scenario email:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate email',
      },
      500,
    );
  }
});

export default app;
