import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
} from 'vitest';

describe('OpenRouter Throughput Routing', () => {
  // Mock the OpenAI client
  const mockStreamResponse = {
    [Symbol.asyncIterator]: async function* () {
      yield {
        choices: [{ delta: { content: 'test response' } }],
      };
    },
  };

  const mockOpenAI = {
    chat: {
      completions: {
        create: vi
          .fn()
          .mockResolvedValue(mockStreamResponse),
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables to enable AI
    process.env.VZCODE_AI_API_KEY = 'test-key';
    process.env.VZCODE_AI_BASE_URL =
      'https://openrouter.ai/api/v1';
  });

  test('generateAIResponse should include provider.sort=throughput parameter', async () => {
    // Mock the OpenAI import
    vi.doMock('openai', () => {
      const OpenAIConstructor = class {
        chat = mockOpenAI.chat;
      };
      return {
        default: OpenAIConstructor,
      };
    });

    // Import the module after mocking
    const { generateAIResponse } = await import(
      '../src/server/generateAIResponse.ts'
    );

    // Create a mock ShareDB document
    const mockShareDBDoc = {
      on: vi.fn(),
      off: vi.fn(),
      submitOp: vi.fn(),
    };

    // Call the function
    await generateAIResponse({
      inputText: 'test input',
      insertionCursor: 0,
      fileId: 'test-file',
      streamId: 'test-stream',
      shareDBDoc: mockShareDBDoc,
    });

    // Verify that the OpenAI client was called with the provider parameter
    expect(
      mockOpenAI.chat.completions.create,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: {
          sort: 'throughput',
        },
      }),
    );
  });

  test('handleAICopilot should include provider.sort=throughput in additionalParameters', async () => {
    // Mock environment variables for copilot
    process.env.VZCODE_AI_COPILOT_API_KEY =
      'test-copilot-key';
    process.env.VZCODE_AI_COPILOT_BASE_URL =
      'https://openrouter.ai/api/v1';
    process.env.VZCODE_AI_COPILOT_MODEL = 'test-model';

    // Mock LangChain ChatOpenAI
    const mockChatOpenAI = {
      invoke: vi
        .fn()
        .mockResolvedValue({ content: 'test response' }),
    };

    vi.doMock('@langchain/openai', () => ({
      ChatOpenAI: class {
        constructor(options) {
          // Verify the options include additionalParameters with provider
          expect(options).toMatchObject({
            additionalParameters: {
              provider: { sort: 'throughput' },
            },
          });
        }

        invoke() {
          return mockChatOpenAI.invoke();
        }
      },
    }));

    vi.doMock('@langchain/core/output_parsers', () => ({
      StringOutputParser: class {
        invoke() {
          return Promise.resolve('parsed response');
        }
      },
    }));

    // Import and test the handler
    const { handleAICopilot } = await import(
      '../src/server/handleAICopilot.ts'
    );
    const handler = handleAICopilot();

    // Mock request and response
    const mockReq = {
      body: {
        prefix: 'test prefix',
        suffix: 'test suffix',
      },
    };
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    await handler(mockReq, mockRes);

    // Verify the response was successful
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      text: 'parsed response',
    });
  });
});
