import { ChatOpenAI } from '@langchain/openai';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import {
  AIMessage,
  HumanMessage,
} from '@langchain/core/messages';
import {
  VizChatId,
  VizChatMessage,
} from '@vizhub/viz-types';

// ---------- Model Configuration ----------
const createModel = (
  model?: string,
  aiRequestOptions?: any,
) => {
  return new ChatOpenAI({
    model:
      model ||
      process.env.VIZHUB_EDIT_WITH_AI_MODEL_NAME ||
      'gpt-4o-mini',
    temperature: 0.7,
    openAIApiKey: process.env.VIZHUB_EDIT_WITH_AI_API_KEY,
    configuration: {
      baseURL:
        process.env.VIZHUB_EDIT_WITH_AI_BASE_URL ||
        'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://vizhub.com',
        'X-Title': 'VizHub',
        ...aiRequestOptions?.headers,
      },
    },
    ...aiRequestOptions,
  });
};

// ---------- Prompt Template (system + history + latest user input) ----------
const createPrompt = (systemPrompt: string) => {
  return ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    new MessagesPlaceholder('history'),
    ['human', '{input}'],
  ]);
};

// ---------- Session-scoped rolling history ----------
const sessions = new Map<
  string,
  (HumanMessage | AIMessage)[]
>();

/**
 * Store last N *turns* (each turn = 1 human + 1 AI message).
 * If MAX_TURNS=6, that's at most 12 messages added to the prompt.
 */
const MAX_TURNS = 6;

function getSessionHistory(
  sessionId: string,
): (HumanMessage | AIMessage)[] {
  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  return sessions.get(sessionId)!;
}

function trimToLastTurns(
  history: (HumanMessage | AIMessage)[],
  maxTurns = MAX_TURNS,
): (HumanMessage | AIMessage)[] {
  // We store only HumanMessage and AIMessage in `history` (no system).
  const maxMessages = maxTurns * 2;
  if (history.length <= maxMessages) return history;
  return history.slice(history.length - maxMessages);
}

/**
 * Converts VZCode chat messages to LangChain message format
 */
function convertToLangChainMessages(
  messages: VizChatMessage[],
): (HumanMessage | AIMessage)[] {
  return messages.map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });
}

/**
 * Creates a LangChain-based chatbot function with proper message history management
 * @param systemPrompt - The system prompt to use
 * @param chatId - The chat ID for session management
 * @param model - Optional model name
 * @param aiRequestOptions - Optional AI request configuration
 */
export const createLangChainChatbot = (
  systemPrompt: string,
  chatId: VizChatId,
  model?: string,
  aiRequestOptions?: any,
) => {
  const llm = createModel(model, aiRequestOptions);
  const prompt = createPrompt(systemPrompt);
  const chain = prompt.pipe(llm);

  return {
    /**
     * Send a message with chat history context
     * @param userInput - The current user input
     * @param chatHistory - Optional existing chat history from ShareDB
     * @returns The AI response
     */
    sendMessage: async (
      userInput: string,
      chatHistory: VizChatMessage[] = [],
    ): Promise<string> => {
      const sessionId = chatId;

      // Get existing session history
      let fullHistory = getSessionHistory(sessionId);

      // If we have fresh chat history from ShareDB, convert and use it
      // (excluding the most recent message which should be the current userInput)
      if (chatHistory.length > 0) {
        const langchainHistory = convertToLangChainMessages(
          chatHistory.slice(0, -1),
        );
        fullHistory = langchainHistory;
      }

      // Trim history to prevent token overflow
      const trimmedHistory = trimToLastTurns(fullHistory);

      // Invoke the chain with history context
      const aiResponse = await chain.invoke({
        input: userInput,
        history: trimmedHistory,
      });

      // Extract content from the response
      const responseContent =
        typeof aiResponse.content === 'string'
          ? aiResponse.content
          : aiResponse.content.toString();

      // Update session history for next round
      fullHistory.push(new HumanMessage(userInput));
      fullHistory.push(new AIMessage(responseContent));

      // Trim and store updated history
      sessions.set(sessionId, trimToLastTurns(fullHistory));

      return responseContent;
    },

    /**
     * Stream a message with chat history context
     * @param userInput - The current user input
     * @param chatHistory - Optional existing chat history from ShareDB
     * @param onChunk - Callback for streaming chunks
     * @returns The complete AI response
     */
    streamMessage: async (
      userInput: string,
      chatHistory: VizChatMessage[] = [],
      onChunk?: (chunk: string) => void,
    ): Promise<string> => {
      const sessionId = chatId;

      // Get existing session history
      let fullHistory = getSessionHistory(sessionId);

      // If we have fresh chat history from ShareDB, convert and use it
      if (chatHistory.length > 0) {
        const langchainHistory = convertToLangChainMessages(
          chatHistory.slice(0, -1),
        );
        fullHistory = langchainHistory;
      }

      // Trim history to prevent token overflow
      const trimmedHistory = trimToLastTurns(fullHistory);

      // Create streaming chain
      const stream = await chain.stream({
        input: userInput,
        history: trimmedHistory,
      });

      let fullContent = '';

      // Process streaming chunks
      for await (const chunk of stream) {
        const chunkContent =
          typeof chunk.content === 'string'
            ? chunk.content
            : chunk.content?.toString() || '';

        if (chunkContent) {
          fullContent += chunkContent;
          onChunk?.(chunkContent);
        }
      }

      // Update session history for next round
      fullHistory.push(new HumanMessage(userInput));
      fullHistory.push(new AIMessage(fullContent));

      // Trim and store updated history
      sessions.set(sessionId, trimToLastTurns(fullHistory));

      return fullContent;
    },
  };
};
