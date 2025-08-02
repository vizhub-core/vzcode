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
  chatId, // Add chatId prop
}: {
  messages: VizChatMessage[];
  aiStatus?: string;
  isLoading: boolean;
  chatId?: string; // Add chatId to the type
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
      {messages.map((msg, index) => {
        // Only the most recent assistant message with diffData can be undone
        const isLastAssistantMessage =
          msg.role === 'assistant' &&
          index === messages.length - 1 &&
          !isLoading; // Can't undo while AI is still generating

        const canUndo =
          isLastAssistantMessage &&
          (msg as any).diffData &&
          (msg as any).beforeFiles &&
          Object.keys((msg as any).diffData || {}).length >
            0;

        return (
          <Message
            key={msg.id}
            id={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
            diffData={(msg as any).diffData}
            beforeFiles={(msg as any).beforeFiles}
            chatId={chatId}
            canUndo={canUndo}
          />
        );
      })}

      {showTypingIndicator && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export const MessageList = memo(MessageListComponent);
