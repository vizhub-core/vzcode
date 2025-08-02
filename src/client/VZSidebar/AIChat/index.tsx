import {
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { VZCodeContext } from '../../VZCodeContext';
import { v4 as uuidv4 } from 'uuid';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import './styles.scss';

const defaultAIChatEndpoint = '/ai-chat-message';

export const AIChat = () => {
  const { aiChatMessage, setAIChatMessage } =
    useContext(VZCodeContext);

  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId] = useState(() => uuidv4());

  const {
    aiChatFocused,
    content,
    aiChatEndpoint = defaultAIChatEndpoint,
    aiChatOptions = {},
    aiChatMode,
    setAIChatMode,
  } = useContext(VZCodeContext);

  // Get current chat data from content
  const currentChat = content?.chats?.[currentChatId];
  const rawMessages = currentChat?.messages || [];
  const aiStatus = currentChat?.aiStatus;
  const aiScratchpad = currentChat?.aiScratchpad;

  // Transform messages to ensure they have required id field - memoized to avoid recreation
  const messages = useMemo(
    () =>
      rawMessages.map((msg, index) => ({
        ...msg,
        id: msg.id || `msg-${index}`,
      })),
    [rawMessages],
  );

  // Check if this is the first time opening the chat (no messages)
  const isEmptyState = rawMessages.length === 0;

  const handleSendMessage = useCallback(async () => {
    if (!aiChatMessage.trim() || isLoading) return;

    setAIChatMessage('');
    setIsLoading(true);

    // Call backend endpoint for AI response
    // The server will handle all ShareDB operations including adding the user message
    try {
      const response = await fetch(aiChatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...aiChatOptions,
          content: aiChatMessage.trim(),
          chatId: currentChatId,
          mode: aiChatMode,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}`,
        );
      }

      // The backend handles all ShareDB operations
      await response.json();
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Server will handle error messages too
    } finally {
      setIsLoading(false);
    }
  }, [
    aiChatMessage,
    isLoading,
    aiChatEndpoint,
    aiChatOptions,
    currentChatId,
  ]);

  return (
    <div className="ai-chat-container">
      <div
        style={{
          padding: '10px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isEmptyState ? (
          <div className="ai-chat-empty">
            <div className="ai-chat-empty-icon">✨</div>
            <h3 className="ai-chat-empty-title">
              Hi, I'm VizBot!
            </h3>
            <div className="ai-chat-empty-text">
              How can I help you?
            </div>
            <div className="ai-chat-empty-examples">
              {aiChatMode === 'ask' ? (
                <>
                  <h4>Try asking questions like:</h4>
                  <ul>
                    <li>"Explain how this works"</li>
                    <li>
                      "How could I change it so that the
                      circles are bigger?"
                    </li>
                    <li>"What does this function do?"</li>
                    <li>
                      "How can I make this more accessible?"
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <h4>Try edit requests like these:</h4>
                  <ul>
                    <li>"Change the circles to squares"</li>
                    <li>
                      "Add a button that toggles the
                      animation"
                    </li>
                    <li>
                      "Fix the CSS so the layout is
                      responsive"
                    </li>
                    <li>
                      "Refactor this function to use
                      async/await"
                    </li>
                  </ul>
                </>
              )}
            </div>
            <div className="ai-chat-empty-text">
              {aiChatMode === 'ask'
                ? 'Type your question below to get started!'
                : 'Type your edit request below to get started!'}
            </div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            aiStatus={aiStatus}
            isLoading={isLoading}
            chatId={currentChatId}
            aiScratchpad={aiScratchpad}
          />
        )}
        <ChatInput
          aiChatMessage={aiChatMessage}
          setAIChatMessage={setAIChatMessage}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          focused={aiChatFocused}
          aiChatMode={aiChatMode}
          setAIChatMode={setAIChatMode}
        />
      </div>
    </div>
  );
};
