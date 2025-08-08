import { describe, test, expect, vi } from 'vitest';
import {
  performAIChat,
  performAIEditing,
} from '../src/server/aiChatHandler/aiEditing.js';
import { dateToTimestamp } from '@vizhub/viz-utils';

describe('AI Chat History Inclusion', () => {
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

  test('should include chat history in performAIChat prompt when history exists', async () => {
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
    mockLLMFunction.mockClear();

    await performAIChat({
      prompt: 'Current user message',
      shareDBDoc: mockShareDBDoc,
      llmFunction: mockLLMFunction,
      chatId: 'chat1',
    });

    expect(mockLLMFunction).toHaveBeenCalledWith(
      expect.stringContaining('Previous conversation:'),
    );
    expect(mockLLMFunction).toHaveBeenCalledWith(
      expect.stringContaining('User: First user message'),
    );
    expect(mockLLMFunction).toHaveBeenCalledWith(
      expect.stringContaining(
        'Assistant: First AI response',
      ),
    );
    expect(mockLLMFunction).toHaveBeenCalledWith(
      expect.stringContaining(
        'Current request:\nCurrent user message',
      ),
    );
  });

  test('should include chat history in performAIEditing prompt when history exists', async () => {
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
    mockLLMFunction.mockClear();

    await performAIEditing({
      prompt: 'Current editing request',
      shareDBDoc: mockShareDBDoc,
      llmFunction: mockLLMFunction,
      runCode: mockRunCode,
      chatId: 'chat1',
    });

    expect(mockLLMFunction).toHaveBeenCalledWith(
      expect.stringContaining('Previous conversation:'),
    );
    expect(mockLLMFunction).toHaveBeenCalledWith(
      expect.stringContaining(
        'User: Previous editing request',
      ),
    );
    expect(mockLLMFunction).toHaveBeenCalledWith(
      expect.stringContaining(
        'Assistant: Previous AI edit',
      ),
    );
    expect(mockLLMFunction).toHaveBeenCalledWith(
      expect.stringContaining(
        'Current request:\nCurrent editing request',
      ),
    );
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
    mockLLMFunction.mockClear();

    await performAIChat({
      prompt: 'First message ever',
      shareDBDoc: mockShareDBDoc,
      llmFunction: mockLLMFunction,
      chatId: 'chat1',
    });

    expect(mockLLMFunction).toHaveBeenCalledWith(
      expect.stringContaining('First message ever'),
    );
    expect(mockLLMFunction).toHaveBeenCalledWith(
      expect.not.stringContaining('Previous conversation:'),
    );
  });

  test('should work correctly when chat does not exist', async () => {
    const mockShareDBDoc = {
      data: {
        files: mockFiles,
        chats: {},
      },
    };
    mockLLMFunction.mockClear();

    await performAIChat({
      prompt: 'New chat message',
      shareDBDoc: mockShareDBDoc,
      llmFunction: mockLLMFunction,
      chatId: 'nonexistent-chat',
    });

    expect(mockLLMFunction).toHaveBeenCalledWith(
      expect.stringContaining('New chat message'),
    );
    expect(mockLLMFunction).toHaveBeenCalledWith(
      expect.not.stringContaining('Previous conversation:'),
    );
  });

  test('should format chat history correctly with multiple exchanges', async () => {
    const chatMessages = [
      {
        id: 'msg1',
        role: 'user',
        content: 'First question',
        timestamp: dateToTimestamp(
          new Date(Date.now() - 20000),
        ),
      },
      {
        id: 'msg2',
        role: 'assistant',
        content: 'First answer',
        timestamp: dateToTimestamp(
          new Date(Date.now() - 15000),
        ),
      },
      {
        id: 'msg3',
        role: 'user',
        content: 'Follow up question',
        timestamp: dateToTimestamp(
          new Date(Date.now() - 10000),
        ),
      },
      {
        id: 'msg4',
        role: 'assistant',
        content: 'Follow up answer',
        timestamp: dateToTimestamp(
          new Date(Date.now() - 5000),
        ),
      },
      {
        id: 'msg5',
        role: 'user',
        content: 'Current question',
        timestamp: dateToTimestamp(new Date()),
      },
    ];

    const mockShareDBDoc =
      createMockShareDBDoc(chatMessages);
    mockLLMFunction.mockClear();

    await performAIChat({
      prompt: 'Current question',
      shareDBDoc: mockShareDBDoc,
      llmFunction: mockLLMFunction,
      chatId: 'chat1',
    });

    const callArg = mockLLMFunction.mock.calls[0][0];

    // Verify the structure and order of the conversation
    expect(callArg).toContain('User: First question');
    expect(callArg).toContain('Assistant: First answer');
    expect(callArg).toContain('User: Follow up question');
    expect(callArg).toContain(
      'Assistant: Follow up answer',
    );
    expect(callArg).toContain(
      'Current request:\nCurrent question',
    );

    // Verify that messages are in the correct order
    const firstQuestionIndex = callArg.indexOf(
      'User: First question',
    );
    const firstAnswerIndex = callArg.indexOf(
      'Assistant: First answer',
    );
    const followUpIndex = callArg.indexOf(
      'User: Follow up question',
    );
    const currentRequestIndex = callArg.indexOf(
      'Current request:',
    );

    expect(firstQuestionIndex).toBeLessThan(
      firstAnswerIndex,
    );
    expect(firstAnswerIndex).toBeLessThan(followUpIndex);
    expect(followUpIndex).toBeLessThan(currentRequestIndex);
  });
});
