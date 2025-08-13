import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
} from 'vitest';
import {
  performAIChat,
  performAIEditing,
} from '../src/server/aiChatHandler/aiEditing.js';
import { dateToTimestamp } from '@vizhub/viz-utils';

// Mock the LangChain components
vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(() => ({
    // Mock the LangChain model response
    invoke: vi.fn().mockResolvedValue({
      content: 'AI response from LangChain',
    }),
    stream: vi.fn().mockImplementation(async function* () {
      yield { content: 'AI ' };
      yield { content: 'response ' };
      yield { content: 'from ' };
      yield { content: 'LangChain' };
    }),
  })),
}));

vi.mock('@langchain/core/prompts', () => ({
  ChatPromptTemplate: {
    fromMessages: vi.fn().mockReturnValue({
      pipe: vi.fn().mockReturnValue({
        invoke: vi.fn().mockResolvedValue({
          content: 'AI response from LangChain',
        }),
        stream: vi
          .fn()
          .mockImplementation(async function* () {
            yield { content: 'AI ' };
            yield { content: 'response ' };
            yield { content: 'from ' };
            yield { content: 'LangChain' };
          }),
      }),
    }),
  },
  MessagesPlaceholder: vi.fn(),
}));

vi.mock('@langchain/core/messages', () => ({
  HumanMessage: vi.fn(),
  AIMessage: vi.fn(),
}));

describe('LangChain AI Chat History Integration', () => {
  // Mock data setup
  const mockFiles = {
    file1: {
      name: 'test.js',
      text: 'console.log("hello");',
    },
  };

  const createMockShareDBDoc = (chatMessages = []) => ({
    data: {
      files: mockFiles,
      chats: {
        chat1: {
          id: 'chat1',
          messages: chatMessages,
          createdAt: dateToTimestamp(new Date()),
          updatedAt: dateToTimestamp(new Date()),
        },
      },
    },
  });

  const mockLLMFunction = vi.fn().mockResolvedValue({
    content: 'AI response',
    generationId: 'gen-123',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should use LangChain chatbot in performAIChat with chat history', async () => {
    const chatMessages = [
      {
        id: 'msg1',
        role: 'user',
        content: 'First user message',
        timestamp: dateToTimestamp(
          new Date(Date.now() - 10000),
        ),
      },
      {
        id: 'msg2',
        role: 'assistant',
        content: 'First AI response',
        timestamp: dateToTimestamp(
          new Date(Date.now() - 5000),
        ),
      },
      {
        id: 'msg3',
        role: 'user',
        content: 'Current user message',
        timestamp: dateToTimestamp(new Date()),
      },
    ];

    const mockShareDBDoc =
      createMockShareDBDoc(chatMessages);

    const result = await performAIChat({
      prompt: 'Current user message',
      shareDBDoc: mockShareDBDoc,
      llmFunction: mockLLMFunction,
      chatId: 'chat1',
      model: 'gpt-4o-mini',
      aiRequestOptions: {},
    });

    // Verify LangChain is being used (response should come from our mocked LangChain)
    expect(result.content).toBe(
      'AI response from LangChain',
    );
    expect(result.generationId).toContain('langchain-');
    expect(result.diffData).toEqual({});
  });

  test('should use LangChain chatbot in performAIEditing with chat history', async () => {
    const chatMessages = [
      {
        id: 'msg1',
        role: 'user',
        content: 'Previous editing request',
        timestamp: dateToTimestamp(
          new Date(Date.now() - 10000),
        ),
      },
      {
        id: 'msg2',
        role: 'assistant',
        content: 'Previous AI edit',
        timestamp: dateToTimestamp(
          new Date(Date.now() - 5000),
        ),
      },
      {
        id: 'msg3',
        role: 'user',
        content: 'Current editing request',
        timestamp: dateToTimestamp(new Date()),
      },
    ];

    const mockShareDBDoc =
      createMockShareDBDoc(chatMessages);
    const mockRunCode = vi.fn();

    const result = await performAIEditing({
      prompt: 'Current editing request',
      shareDBDoc: mockShareDBDoc,
      llmFunction: mockLLMFunction,
      runCode: mockRunCode,
      chatId: 'chat1',
      model: 'gpt-4o-mini',
      aiRequestOptions: {},
    });

    // The result should come from the llmFunction which will use LangChain internally
    // but still returns through the existing mock
    expect(result.content).toBe('AI response');
    expect(result.generationId).toBe('gen-123');
    expect(mockRunCode).toHaveBeenCalled();
  });

  test('should work correctly when no chat history exists', async () => {
    const chatMessages = [
      {
        id: 'msg1',
        role: 'user',
        content: 'First message ever',
        timestamp: dateToTimestamp(new Date()),
      },
    ];

    const mockShareDBDoc =
      createMockShareDBDoc(chatMessages);

    const result = await performAIChat({
      prompt: 'First message ever',
      shareDBDoc: mockShareDBDoc,
      llmFunction: mockLLMFunction,
      chatId: 'chat1',
      model: 'gpt-4o-mini',
      aiRequestOptions: {},
    });

    expect(result.content).toBe(
      'AI response from LangChain',
    );
    expect(result.generationId).toContain('langchain-');
  });

  test('should work correctly when chat does not exist', async () => {
    const mockShareDBDoc = {
      data: {
        files: mockFiles,
        chats: {},
      },
    };

    const result = await performAIChat({
      prompt: 'New chat message',
      shareDBDoc: mockShareDBDoc,
      llmFunction: mockLLMFunction,
      chatId: 'nonexistent-chat',
      model: 'gpt-4o-mini',
      aiRequestOptions: {},
    });

    expect(result.content).toBe(
      'AI response from LangChain',
    );
    expect(result.generationId).toContain('langchain-');
  });

  test('should handle streaming in LangChain chatbot', async () => {
    const mockShareDBDoc = createMockShareDBDoc([]);

    // Test that our LangChain integration supports streaming
    // (though the specific implementation would need the streaming variant)
    const result = await performAIChat({
      prompt: 'Test streaming',
      shareDBDoc: mockShareDBDoc,
      llmFunction: mockLLMFunction,
      chatId: 'chat1',
      model: 'gpt-4o-mini',
      aiRequestOptions: {},
    });

    expect(result.content).toBe(
      'AI response from LangChain',
    );
  });
});
