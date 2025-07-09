import { test, expect } from 'vitest';
import z from 'zod';
import ToolManager, { ToolDefinition } from './context/tools';
import { DefaultContextGenerator } from './context/context';
import { Event } from './types';
import { LLMClient } from './llm';
import { ALL_MOCK_TOOLS } from './mocktools';


test('First updates the urgency of the thread', async () => {
    // arrange
    const toolManager = new ToolManager();
    const tool = new ALL_MOCK_TOOLS.UpdateThreadUrgencyTool();
    toolManager.registerTool(tool);

    const eventLog: Event[] = [
        {
            timestamp: new Date(),
            type: 'email_received',
            actor: 'customer',
            id: '1',
            data: {
                subject: 'Unable to login to my account',
                body: 'Hi, I have been trying to login to my account for the past hour but keep getting an error message saying "Invalid credentials". I am sure I am using the correct password. Can you please help me resolve this issue? My email is john.doe@example.com. Thank you.',
                from: 'john.doe@example.com',
                to: 'support@company.com'
            }
        }
    ];
    const contextGenerator = new DefaultContextGenerator(eventLog, toolManager);
    

    const client = new LLMClient();
    // action
    const response = await client.getNextToolCall(contextGenerator.getSystemPrompt(), contextGenerator.getMessage());

    // assert
    expect(response).toBeDefined();
    expect(response.tool_call).toBeDefined();
    expect(response.tool_call.name).toBe(tool.name);
    expect(response.tool_call.args).toBeDefined();
    expect(response.tool_call.args.urgency).toBe('high');
})