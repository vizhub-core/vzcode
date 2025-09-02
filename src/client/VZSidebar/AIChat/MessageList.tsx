import {
  useRef,
  useEffect,
  useCallback,
  memo,
  useState,
} from 'react';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { ThinkingScratchpad } from './ThinkingScratchpad';
import { VizChatMessage } from '@vizhub/viz-types';

const MessageListComponent = ({
  messages,
  isLoading,
  chatId, // Add chatId prop
  aiScratchpad, // Add aiScratchpad prop
}: {
  messages: VizChatMessage[];
  isLoading: boolean;
  chatId?: string; // Add chatId to the type
  aiScratchpad?: string; // Add aiScratchpad to the type
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolled, setIsUserScrolled] =
    useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] =
    useState(true);
  const scrollTimeoutRef =
    useRef<ReturnType<typeof setTimeout>>();

  // Check if the user is scrolled to the bottom
  const isScrolledToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const threshold = 50; // Allow 50px tolerance for "at bottom"
    const { scrollTop, scrollHeight, clientHeight } =
      container;
    return (
      scrollHeight - scrollTop - clientHeight < threshold
    );
  }, []);

  // Smooth scroll to bottom with linear transition
  const scrollToBottom = useCallback(() => {
    if (!autoScrollEnabled) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [autoScrollEnabled]);

  // Handle scroll events to detect user manual scrolling
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isAtBottom = isScrolledToBottom();

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // If user scrolled up from bottom, disable auto-scroll
    if (!isAtBottom && !isUserScrolled) {
      setIsUserScrolled(true);
      setAutoScrollEnabled(false);
    }

    // If user scrolled back to bottom, re-enable auto-scroll after a brief delay
    if (isAtBottom && isUserScrolled) {
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolled(false);
        setAutoScrollEnabled(true);
      }, 500); // 500ms delay to prevent flickering
    }
  }, [isUserScrolled, isScrolledToBottom]);

  // Auto-scroll when messages change, but only if auto-scroll is enabled
  useEffect(() => {
    if (autoScrollEnabled && !isUserScrolled) {
      // Use a short debounce to prevent multiple scroll calls during rapid updates
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        scrollToBottom();
      }, 100); // 100ms debounce
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [
    messages,
    autoScrollEnabled,
    isUserScrolled,
    scrollToBottom,
  ]);

  // Track previous loading state to detect when AI generation completes
  const [prevIsLoading, setPrevIsLoading] =
    useState(isLoading);

  // Scroll to bottom when AI generation completes (loading changes from true to false)
  useEffect(() => {
    // If AI was generating and now it's finished, scroll to bottom
    if (prevIsLoading && !isLoading) {
      // Force scroll to bottom regardless of user scroll state
      // This ensures we always scroll to bottom when generation completes
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });

      // Re-enable auto-scroll for future messages
      setIsUserScrolled(false);
      setAutoScrollEnabled(true);
    }

    setPrevIsLoading(isLoading);
  }, [isLoading, prevIsLoading]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Check if AI generation has started (last message is from assistant)
  const lastMessage = messages[messages.length - 1];
  const aiGenerationStarted =
    lastMessage?.role === 'assistant' &&
    lastMessage.content !== '';

  // Show typing indicator only when loading and AI generation hasn't started yet
  const showTypingIndicator =
    isLoading && !aiGenerationStarted;

  // Show thinking scratchpad when AI is thinking (has scratchpad content)
  const showThinkingScratchpad = Boolean(
    aiScratchpad && aiScratchpad.trim(),
  );

  // Find the most recent assistant message index
  const lastAssistantMessageIndex = messages
    .map((m, i) => (m.role === 'assistant' ? i : -1))
    .filter((i) => i !== -1)
    .pop();

  return (
    <div
      className="ai-chat-messages"
      ref={messagesContainerRef}
      onScroll={handleScroll}
    >
      {messages.map((msg, index) => {
        // Only show additionalWidgets for the most recent assistant message
        const showAdditionalWidgets =
          msg.role === 'assistant' &&
          index === lastAssistantMessageIndex;

        return (
          <Message
            key={msg.id}
            id={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
            diffData={(msg as any).diffData}
            chatId={chatId}
            showAdditionalWidgets={showAdditionalWidgets}
          />
        );
      })}

      {showThinkingScratchpad && (
        <ThinkingScratchpad
          content={aiScratchpad || ''}
          isVisible={showThinkingScratchpad}
        />
      )}

      {showTypingIndicator && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export const MessageList = memo(MessageListComponent);
