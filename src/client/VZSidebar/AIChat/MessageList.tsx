import {
  useRef,
  useEffect,
  useCallback,
  memo,
} from 'react';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';

interface MessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface MessageListProps {
  messages: MessageData[];
  aiStatus?: string;
  isLoading: boolean;
}

const MessageListComponent = ({
  messages,
  aiStatus,
  isLoading,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      {isLoading && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export const MessageList = memo(MessageListComponent);
