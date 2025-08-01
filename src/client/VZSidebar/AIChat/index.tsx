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
  } = useContext(VZCodeContext);

  // Get current chat data from content
  const currentChat = content?.chats?.[currentChatId];
  const rawMessages = currentChat?.messages || [];
  const aiStatus = currentChat?.aiStatus;

  // Transform messages to ensure they have required id field - memoized to avoid recreation
  const messages = useMemo(
    () =>
      rawMessages.map((msg, index) => ({
        ...msg,
        id: msg.id || `msg-${index}`,
      })),
    [rawMessages],
  );

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
      <MessageList
        messages={messages}
        aiStatus={aiStatus}
        isLoading={isLoading}
      />
      <ChatInput
        aiChatMessage={aiChatMessage}
        setAIChatMessage={setAIChatMessage}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        focused={aiChatFocused}
      />
    </div>
  );
};
