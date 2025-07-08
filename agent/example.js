// Example usage of the ProResponse Agent
// Make sure you have a .env file with OPENAI_API_KEY=your-api-key

const { assistSupportPerson } = require('./dist/index');

async function runExample() {
  console.log('🤖 ProResponse Agent Example\n');
  
  try {
    // Example customer email
    const customerEmail = `
Hi there,

I ordered a premium subscription last week (Order #12345) but I still don't have access to the premium features. I've tried logging out and back in but nothing changed. 

This is really frustrating as I needed these features for an important project. Can you please help me get this sorted out ASAP?

Thanks,
John Smith
john.smith@email.com
    `.trim();

    // Additional context from support person
    const context = `
Customer Info:
- Account: john.smith@email.com
- Order #12345 placed on 2024-01-15
- Payment processed successfully ($29.99)
- Account shows active subscription but features not unlocked
- Previous support ticket: None
    `.trim();

    console.log('📧 Customer Email:');
    console.log(customerEmail);
    console.log('\n📋 Support Context:');
    console.log(context);
    console.log('\n🔄 Processing with AI agent...\n');

    // Call the agent
    const response = await assistSupportPerson(customerEmail, context);

    console.log('🧠 Agent Reasoning:');
    console.log('─'.repeat(50));
    console.log(response.reasoning);
    console.log('\n📝 Drafted Response:');
    console.log('─'.repeat(50));
    console.log(response.draft);
    console.log('\n✅ Example completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Tip: Make sure you have a .env file with OPENAI_API_KEY=your-api-key');
    }
  }
}

// Run the example
if (require.main === module) {
  runExample();
} 