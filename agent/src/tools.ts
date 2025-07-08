// Basic tools for the support agent assistant
// No knowledge base - agent should work with provided context only

export const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_current_time',
      description: 'Gets the current date and time for timestamping responses',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  }
];

export async function handleToolCall(name: string, args: any) {
  console.log(`[Agent] Executing tool: ${name}`);
  
  switch (name) {
    case 'get_current_time':
      return new Date().toISOString();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
