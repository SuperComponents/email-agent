import { assistSupportPerson } from './agent';
import { openai } from './openaiClient';

// Mock the entire openai client
jest.mock('./openaiClient', () => ({
  openai: {
    beta: {
      assistants: {
        create: jest.fn(),
      },
      threads: {
        create: jest.fn(),
        messages: {
          create: jest.fn(),
          list: jest.fn(),
        },
        runs: {
          create: jest.fn(),
          retrieve: jest.fn(),
          submitToolOutputs: jest.fn(), // Added this mock
        },
      },
    },
  },
}));

// Mock the tools module if it's used indirectly or directly by assistSupportPerson
jest.mock('./tools', () => ({
  tools: [], // Mock tools array
  handleToolCall: jest.fn(), // Mock handleToolCall function
}));


describe('assistSupportPerson', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Provide default mock implementations to avoid TypeError: Cannot read properties of undefined
    (openai.beta.assistants.create as jest.Mock).mockResolvedValue({ id: 'mock-assistant-id' });
    (openai.beta.threads.create as jest.Mock).mockResolvedValue({ id: 'mock-thread-id' });
    (openai.beta.threads.messages.create as jest.Mock).mockResolvedValue({});
    (openai.beta.threads.runs.create as jest.Mock).mockResolvedValue({ id: 'mock-run-id', status: 'queued' });
    (openai.beta.threads.runs.retrieve as jest.Mock).mockImplementation((threadId, runId) => {
      // Default to completed status to allow tests to finish
      // Specific tests can override this for requires_action, etc.
      return Promise.resolve({ id: runId, status: 'completed' });
    });
    (openai.beta.threads.runs.submitToolOutputs as jest.Mock).mockResolvedValue({ id: 'mock-run-id', status: 'completed' });

  });

  it('should correctly process string content from assistant message', async () => {
    // Mock messages.list to return a message with string content
    (openai.beta.threads.messages.list as jest.Mock).mockResolvedValue({
      data: [
        {
          role: 'assistant',
          content: 'REASONING: This is a test reasoning string. DRAFT: This is a test draft string.',
        },
      ],
    });

    const customerEmail = 'Test email';
    const response = await assistSupportPerson(customerEmail);

    expect(response.reasoning).toBe('This is a test reasoning string.');
    expect(response.draft).toBe('This is a test draft string.');
    expect(openai.beta.threads.messages.list).toHaveBeenCalledTimes(1);
  });

  it('should correctly process array content from assistant message', async () => {
    // Mock messages.list to return a message with array content
    (openai.beta.threads.messages.list as jest.Mock).mockResolvedValue({
      data: [
        {
          role: 'assistant',
          content: [
            {
              type: 'text',
              text: {
                value: 'REASONING: This is array reasoning. DRAFT: This is array draft.',
              },
            },
          ],
        },
      ],
    });

    const customerEmail = 'Test email for array content';
    const response = await assistSupportPerson(customerEmail);

    expect(response.reasoning).toBe('This is array reasoning.');
    expect(response.draft).toBe('This is array draft.');
    expect(openai.beta.threads.messages.list).toHaveBeenCalledTimes(1);
  });

  it('should handle missing DRAFT section by returning the whole content as draft', async () => {
    (openai.beta.threads.messages.list as jest.Mock).mockResolvedValue({
      data: [
        {
          role: 'assistant',
          content: 'REASONING: Only reasoning is provided here.',
        },
      ],
    });

    const customerEmail = 'Test email no draft';
    const response = await assistSupportPerson(customerEmail);

    expect(response.reasoning).toBe('Only reasoning is provided here.');
    expect(response.draft).toBe('REASONING: Only reasoning is provided here.');
  });

  it('should handle missing REASONING section', async () => {
    (openai.beta.threads.messages.list as jest.Mock).mockResolvedValue({
      data: [
        {
          role: 'assistant',
          content: 'DRAFT: Only draft is provided here.',
        },
      ],
    });

    const customerEmail = 'Test email no reasoning';
    const response = await assistSupportPerson(customerEmail);

    expect(response.reasoning).toBe('No reasoning provided');
    expect(response.draft).toBe('Only draft is provided here.');
  });

  it('should handle content that is just a simple string without REASONING or DRAFT', async () => {
    const simpleContent = "This is a simple message without keywords.";
    (openai.beta.threads.messages.list as jest.Mock).mockResolvedValue({
      data: [
        {
          role: 'assistant',
          content: simpleContent,
        },
      ],
    });

    const customerEmail = 'Test email simple string';
    const response = await assistSupportPerson(customerEmail);

    expect(response.reasoning).toBe('No reasoning provided');
    expect(response.draft).toBe(simpleContent);
  });

  it('should correctly parse draft when reasoning is multi-line', async () => {
    (openai.beta.threads.messages.list as jest.Mock).mockResolvedValue({
      data: [
        {
          role: 'assistant',
          content: 'REASONING: This is line one.\nThis is line two. DRAFT: This is the draft.',
        },
      ],
    });

    const customerEmail = 'Test email multiline reasoning';
    const response = await assistSupportPerson(customerEmail);

    expect(response.reasoning).toBe('This is line one.\nThis is line two.');
    expect(response.draft).toBe('This is the draft.');
  });

  it('should correctly parse draft when reasoning and draft are multi-line', async () => {
    (openai.beta.threads.messages.list as jest.Mock).mockResolvedValue({
      data: [
        {
          role: 'assistant',
          content: 'REASONING: Reasoning line 1.\nReasoning line 2. DRAFT: Draft line 1.\nDraft line 2.',
        },
      ],
    });

    const customerEmail = 'Test email multiline reasoning and draft';
    const response = await assistSupportPerson(customerEmail);

    expect(response.reasoning).toBe('Reasoning line 1.\nReasoning line 2.');
    expect(response.draft).toBe('Draft line 1.\nDraft line 2.');
  });

  // Test for tool call handling
  it('should handle tool calls if run status is requires_action', async () => {
    const mockToolCall = {
      id: 'tool_call_123',
      type: 'function' as const, // Ensure type is 'function'
      function: {
        name: 'mockTool',
        arguments: '{}',
      },
    };

    // First retrieve returns 'requires_action', second returns 'completed'
    (openai.beta.threads.runs.retrieve as jest.Mock)
      .mockResolvedValueOnce({
        id: 'mock-run-id',
        status: 'requires_action',
        required_action: {
          submit_tool_outputs: {
            tool_calls: [mockToolCall],
          },
        },
      })
      .mockResolvedValueOnce({ id: 'mock-run-id', status: 'completed' });

    // Mock handleToolCall to resolve successfully
    const mockedHandleToolCall = require('./tools').handleToolCall;
    mockedHandleToolCall.mockResolvedValue('Tool output');

    // Mock messages.list for the final 'completed' state
    (openai.beta.threads.messages.list as jest.Mock).mockResolvedValue({
      data: [
        {
          role: 'assistant',
          content: 'REASONING: Tool call handled. DRAFT: Draft after tool call.',
        },
      ],
    });

    const customerEmail = 'Test email with tool call';
    const response = await assistSupportPerson(customerEmail);

    expect(mockedHandleToolCall).toHaveBeenCalledWith('mockTool', {});
    expect(openai.beta.threads.runs.submitToolOutputs).toHaveBeenCalledWith(
      'mock-thread-id',
      'mock-run-id',
      {
        tool_outputs: [
          {
            tool_call_id: 'tool_call_123',
            output: 'Tool output',
          },
        ],
      }
    );
    expect(response.reasoning).toBe('Tool call handled.');
    expect(response.draft).toBe('Draft after tool call.');
  });

});
