# ProResponse Agent

A focused TypeScript library providing an AI support agent assistant that helps support teams draft customer responses.

## Overview

ProResponse Agent is a lightweight TypeScript/JavaScript library that provides an AI assistant to help support teams draft customer responses. The agent:

- ✅ Analyzes customer emails and drafts appropriate responses
- ✅ Provides reasoning behind its suggestions  
- ✅ Maintains a professional, empathetic tone
- ✅ Offers clear next steps for customers
- ✅ Works as a pure function - no CLI, backend, or UI dependencies
- ✅ Built on OpenAI's Assistants API with tool support

## Architecture

**Roles:**
- **Agent**: The core LLM agent that assists the support person
- **Support Person**: A human who oversees the agent and approves/refines output

**Philosophy**: Provides AI systems for how to think, not what to think. Given the right variables, the AI can reason through any support scenario.

## Installation

Install the dependencies:

```bash
npm install
```

Install development dependencies for TypeScript compilation:

```bash
npm install --save-dev typescript @types/node
```

## Environment Setup

Create a `.env` file in your project root:

```bash
echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
```

## Building

Compile TypeScript to JavaScript:

```bash
npm run build
```

This creates the compiled JavaScript files in the `dist/` directory.

## Usage

### Basic Usage

```typescript
import { assistSupportPerson } from 'proresponse-agent';

async function handleCustomerEmail() {
  try {
    const response = await assistSupportPerson(
      "Hi, I ordered a widget last week but it hasn't arrived. Can I get a refund?",
      "Customer ordered on 2024-01-15, order #12345, standard shipping"
    );

    console.log('🧠 Agent Reasoning:');
    console.log(response.reasoning);
    console.log('\n📝 Drafted Response:');
    console.log(response.draft);
    
    // The support person can now review, edit, and send the draft
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

handleCustomerEmail();
```

### Advanced Usage with Custom Model

```typescript
import { assistSupportPerson } from 'proresponse-agent';

const response = await assistSupportPerson(
  customerEmail,
  supportPersonContext,
  'gpt-4o-mini' // Use a different OpenAI model
);
```

## API Reference

### `assistSupportPerson(customerEmail, context?, model?)`

**Parameters:**
- `customerEmail` (string, required): The raw customer email text
- `context` (string, optional): Additional context from the support person (order details, history, etc.)
- `model` (string, optional): OpenAI model to use (default: 'gpt-4o')

**Returns:** `Promise<AgentResponse>`

```typescript
interface AgentResponse {
  draft: string;      // The drafted email response in markdown format
  reasoning: string;  // The agent's step-by-step analysis
}
```

**Throws:** 
- OpenAI API errors if authentication fails or API limits are exceeded
- Network errors if connection to OpenAI fails

## Example Output

```
🧠 Agent Reasoning: 
1. Customer is asking about a delayed order and requesting a refund
2. This appears to be a shipping delay issue that needs empathetic handling
3. Should acknowledge the delay, apologize, and provide actionable next steps
4. Need to balance customer satisfaction with company policy
5. Request order details to provide specific assistance

📝 Drafted Response:
Dear Customer,

I sincerely apologize for the delay with your widget order. I understand how frustrating this must be, especially when you're expecting your purchase to arrive on time.

Let me help you resolve this issue right away. To provide you with the most accurate information, could you please share your order number? Once I have that, I can:

1. Check the current shipping status
2. Provide an updated delivery timeline
3. Explore refund or replacement options if needed

I'm committed to making this right for you as quickly as possible.

Best regards,
Customer Support Team
```

## Project Structure

```
ProResponse/
├── src/
│   ├── agent.ts          # Core agent functionality
│   ├── openaiClient.ts   # OpenAI SDK wrapper with environment config
│   ├── tools.ts          # Available tools for the agent (time, etc.)
│   └── index.ts          # Main library exports
├── dist/                 # Compiled JavaScript output
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env                  # Environment variables (create this)
└── README.md            # This file
```

## Available Tools

The agent has access to these tools:
- `get_current_time`: Gets current date/time for timestamping responses

Additional tools can be easily added by extending `src/tools.ts`.

## Requirements

- **Node.js**: 18+ (LTS recommended)
- **TypeScript**: 5.0+ (for development)
- **OpenAI API Key**: Required for all functionality

## Error Handling

Common issues and solutions:

**Authentication Error**:
```
❌ Error: Invalid API key
```
- Verify your `.env` file contains a valid `OPENAI_API_KEY`

**Network Timeout**:
```
❌ Error: Request timeout
```
- Check your internet connection
- OpenAI API may be experiencing issues

**Rate Limiting**:
```
❌ Error: Rate limit exceeded
```
- Wait before retrying
- Consider upgrading your OpenAI plan for higher limits

## Development

### Running in Development

```bash
# Compile TypeScript
npm run build

# Test the compiled output
node dist/index.js
```

### Adding New Tools

1. Define your tool in `src/tools.ts`:
```typescript
{
  type: 'function' as const,
  function: {
    name: 'your_tool_name',
    description: 'What your tool does',
    parameters: { /* JSON schema */ }
  }
}
```

2. Add the handler in the switch statement:
```typescript
case 'your_tool_name':
  return await yourToolFunction(args);
```

## Contributing

1. Follow the existing code style
2. Add comprehensive logging with `console.log('[Agent] ...')`
3. Ensure all functionality is fully operational (no mock data)
4. Test with real OpenAI API calls

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the error handling section above
- Verify your OpenAI API key and billing status
- Ensure you're using a supported Node.js version (18+) 