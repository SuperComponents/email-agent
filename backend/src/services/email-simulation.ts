import { db } from '../database/db.js';
import { emails, threads } from '../database/schema.js';
import { processEmail } from 'agent3';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../config/env.js';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

interface Scenario {
  id: string;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  user_type: string;
  device: string;
  tags: string[];
}

interface ScenariosData {
  scenarios: Scenario[];
}

// In-memory simulation state
let isSimulationRunning = false;
let simulationInterval: NodeJS.Timeout | null = null;
let emailCount = 0;

// Customer personas for consistency
const customerPersonas = [
  { name: 'Sarah Johnson', email: 'sarah.j@gmail.com', tone: 'polite' },
  { name: 'Mike Chen', email: 'mchen.dev@yahoo.com', tone: 'technical' },
  { name: 'Lisa Rodriguez', email: 'l.rodriguez@outlook.com', tone: 'frustrated' },
  { name: 'David Kim', email: 'david.kim.2024@gmail.com', tone: 'formal' },
  { name: 'Emma Wilson', email: 'emmaw88@hotmail.com', tone: 'casual' },
  { name: 'James Thompson', email: 'jthompson.work@gmail.com', tone: 'demanding' },
  { name: 'Maria Gonzalez', email: 'maria.g.learning@gmail.com', tone: 'enthusiastic' },
  { name: 'Alex Turner', email: 'alex.turner.student@edu.com', tone: 'confused' },
];

// Load scenarios from JSON file
async function loadScenarios(): Promise<Scenario[]> {
  try {
    // Try Docker mount path first, fallback to relative path for local development
    const dockerPath = '/demo-data/scenarios.json';
    const localPath = path.join(process.cwd(), '../demo-data/scenarios.json');
    
    let scenariosPath = dockerPath;
    try {
      await fs.access(dockerPath);
    } catch {
      scenariosPath = localPath;
    }
    
    const data = await fs.readFile(scenariosPath, 'utf-8');
    const scenarios = JSON.parse(data) as ScenariosData;
    return scenarios.scenarios;
  } catch (error) {
    console.error('Error loading scenarios:', error);
    return [];
  }
}

// Generate a realistic customer email based on scenario
async function generateEmailFromScenario(scenario: Scenario) {
  const persona = customerPersonas[Math.floor(Math.random() * customerPersonas.length)];
  
  // Note: Urgency mapping available for future enhancement
  // severity levels: low, medium, high
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are generating a realistic customer support email for a language learning app called "Treslingo".
        
        Customer persona: ${persona.name} with a ${persona.tone} communication style.
        
        Generate a realistic email that:
        - Addresses the specific issue described in the scenario
        - Matches the customer's communication tone (${persona.tone})
        - Uses appropriate urgency level for ${scenario.severity} severity
        - Includes relevant details about their device (${scenario.device}) and user type (${scenario.user_type})
        - Is 2-4 paragraphs typical for customer emails
        - Sounds natural and authentic
        - Include specific details that make the email feel real
        
        Tone guidelines:
        - polite: courteous, patient, understanding
        - technical: specific details, technical terms, systematic
        - frustrated: shows irritation but remains civil
        - formal: professional, structured, detailed
        - casual: friendly, conversational, relaxed
        - demanding: direct, expects quick resolution
        - enthusiastic: positive, eager, appreciative
        - confused: asks clarifying questions, uncertain
        
        Return ONLY the email body text, no subject line, signatures, or greetings beyond "Hi" or "Hello".`,
      },
      {
        role: 'user',
        content: `Scenario: ${scenario.title}
        Description: ${scenario.description}
        Category: ${scenario.category} > ${scenario.subcategory}
        Device: ${scenario.device}
        User Type: ${scenario.user_type}
        Tags: ${scenario.tags.join(', ')}
        
        Generate the customer email.`,
      },
    ],
    temperature: 0.8,
    max_tokens: 400,
  });

  return {
    content: completion.choices[0].message.content || `Hi, I'm having an issue with ${scenario.title.toLowerCase()}. ${scenario.description}`,
    persona,
    scenario
  };
}

// Create a new email thread with agent action logging
async function createEmailFromScenario(scenario: Scenario) {
  try {
    const emailData = await generateEmailFromScenario(scenario);
    
    // Create thread
    const [thread] = await db
      .insert(threads)
      .values({
        subject: scenario.title,
        participant_emails: [emailData.persona.email, 'support@treslingo.com'],
        // status: scenario.severity === 'high' ? 'needs_attention' : 'active',
        status: 'active',
        is_unread: true,
        last_activity_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    // Create email
    const [email] = await db
      .insert(emails)
      .values({
        thread_id: thread.id,
        from_email: emailData.persona.email,
        to_emails: ['support@treslingo.com'],
        cc_emails: null,
        bcc_emails: null,
        subject: scenario.title,
        body_text: emailData.content,
        body_html: `<html><body>${emailData.content.replace(/\n/g, '<br>')}</body></html>`,
        direction: 'inbound',
        is_draft: false,
        sent_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();


    const logger = (message: unknown) => console.log(message);
    await processEmail(thread.id, logger);

    emailCount++;
    console.log(`✉️  Generated email from scenario: ${scenario.title} (Total: ${emailCount})`);
    
    return { thread, email, scenario };
  } catch (error) {
    console.error('Error creating email from scenario:', error);
    throw error;
  }
}

// Start email simulation
export async function startEmailSimulation(intervalMs: number = 90000) { // Default 1.5 minutes
  if (isSimulationRunning) {
    return { success: false, message: 'Simulation already running' };
  }

  try {
    const scenarios = await loadScenarios();
    if (scenarios.length === 0) {
      return { success: false, message: 'No scenarios available' };
    }

    isSimulationRunning = true;
    emailCount = 0;

    // Generate first email immediately
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    await createEmailFromScenario(randomScenario);

    // Set up interval for additional emails
    simulationInterval = setInterval(() => {
      void (async () => {
        try {
          const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
          await createEmailFromScenario(randomScenario);
        } catch (error) {
          console.error('Error in simulation interval:', error);
        }
      })();
    }, intervalMs);

    console.log(`🚀 Email simulation started (interval: ${intervalMs}ms)`);
    return { 
      success: true, 
      message: 'Email simulation started', 
      intervalMs,
      scenariosCount: scenarios.length 
    };
  } catch (error) {
    isSimulationRunning = false;
    console.error('Error starting email simulation:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to start simulation' 
    };
  }
}

// Stop email simulation
export function stopEmailSimulation() {
  if (!isSimulationRunning) {
    return { success: false, message: 'Simulation not running' };
  }

  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }

  isSimulationRunning = false;
  
  console.log(`🛑 Email simulation stopped (Generated ${emailCount} emails)`);
  return { 
    success: true, 
    message: 'Email simulation stopped', 
    totalEmailsGenerated: emailCount 
  };
}

// Get simulation status
export function getSimulationStatus() {
  return {
    isRunning: isSimulationRunning,
    emailsGenerated: emailCount,
    startTime: simulationInterval ? new Date() : null, // Simplified for MVP
  };
}

// Generate a single email immediately (for testing)
export async function generateSingleEmail() {
  try {
    const scenarios = await loadScenarios();
    if (scenarios.length === 0) {
      return { success: false, message: 'No scenarios available' };
    }

    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const result = await createEmailFromScenario(randomScenario);
    
    return { 
      success: true, 
      message: 'Email generated successfully',
      thread: result.thread,
      email: result.email,
      scenario: result.scenario 
    };
  } catch (error) {
    console.error('Error generating single email:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to generate email' 
    };
  }
}