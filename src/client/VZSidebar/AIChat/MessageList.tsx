import {
  useRef,
  useEffect,
  useCallback,
  memo,
} from 'react';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { VizChatMessage } from '@vizhub/viz-types';

const MessageListComponent = ({
  messages,
  aiStatus,
  isLoading,
}: {
  messages: VizChatMessage[];
  aiStatus?: string;
  isLoading: boolean;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if AI generation has started (last message is from assistant)
  const lastMessage = messages[messages.length - 1];
  const aiGenerationStarted =
    lastMessage?.role === 'assistant' &&
    lastMessage.content !== '';

  // Show typing indicator only when loading and AI generation hasn't started yet
  const showTypingIndicator =
    isLoading && !aiGenerationStarted;

  return (
    <div className="ai-chat-messages">
      {messages.map((msg) => (
        <Message
          key={msg.id}
          id={msg.id}
          role={msg.role}
          content={msg.content}
          timestamp={msg.timestamp}
        />
      ))}

      {showTypingIndicator && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export const MessageList = memo(MessageListComponent);
