import { OpenAI } from 'openai';
import { Agent, run } from '@openai/agents';
import { env } from '../config/environment.js';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

async function getModels() {
  const x = await openai.models.list();
  x.data.forEach(model => {
    console.log(model);
  });
}

async function seeIfModelActuallyWorks(modelName: string): Promise<boolean> {
  console.log(`Testing ${modelName}...`);
  const startTime = Date.now();

  try {
    // Create a promise that rejects after 8 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout after 8 seconds')), 8000);
    });

    // Create the actual test promise
    const testPromise = (async () => {
      // Create a simple agent with the model
      const agent = new Agent({
        name: 'TestAgent',
        model: modelName,
        instructions: 'You are a test agent. Always respond with "OK" when asked.',
      });

      // Run the agent with a simple prompt
      const result = await run(
        agent,
        [{ role: 'user', content: 'Say "OK" if you can read this.' }],
        { maxTurns: 1 },
      );

      // Get the final output
      const responseText = result.finalOutput || '';

      return responseText.toLowerCase().includes('ok');
    })();

    // Race between timeout and actual test
    const success = await Promise.race([testPromise, timeoutPromise]);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`  ✅ Success (${elapsed}s)`);
    return success;
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  ❌ ${errorMessage} (${elapsed}s)`);
    return false;
  }
}

async function testCommonModels() {
  const modelsToTest = [
    'gpt-4',
    'gpt-4-turbo-preview',
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'o1-preview',
    'o1-mini',
  ];

  console.log('Testing common models with @openai/agents...\n');

  for (const model of modelsToTest) {
    await seeIfModelActuallyWorks(model);
  }
}

async function testAllAvailableModels() {
  console.log('Fetching all available models...\n');

  const modelsList = await openai.models.list();
  const chatModels = modelsList.data.filter(
    model =>
      model.id.includes('gpt') ||
      model.id.includes('o1') ||
      model.id.includes('o3') ||
      model.id.includes('o4') ||
      model.id.includes('4o') ||
      model.id.includes('chatgpt'),
  );

  console.log(`Found ${chatModels.length} chat models. Testing each one...\n`);

  for (const model of chatModels) {
    await seeIfModelActuallyWorks(model.id);
  }
}

// Run one of these:
void getModels(); // List all models
void testCommonModels(); // Test common models
void testAllAvailableModels(); // Test all available chat models
