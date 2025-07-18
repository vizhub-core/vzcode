import { useRef, useEffect } from 'react';
import { Message } from './Message';
import { StreamingMessage } from './StreamingMessage';
import { TypingIndicator } from './TypingIndicator';

interface MessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface MessageListProps {
  messages: MessageData[];
  aiScratchpad?: string;
  aiStatus?: string;
  isLoading: boolean;
}

export const MessageList = ({
  messages,
  aiScratchpad,
  aiStatus,
  isLoading,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiScratchpad]);

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

      {/* Show streaming content if available */}
      {aiScratchpad && (
        <StreamingMessage
          content={aiScratchpad}
          status={aiStatus}
        />
      )}

      {isLoading && !aiScratchpad && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};
