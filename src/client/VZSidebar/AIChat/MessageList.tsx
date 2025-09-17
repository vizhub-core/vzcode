import {
  useRef,
  useEffect,
  useCallback,
  memo,
  useState,
} from 'react';
import { Message } from './Message';
import { StreamingMessage } from './StreamingMessage';
import { TypingIndicator } from './TypingIndicator';
import { ThinkingScratchpad } from './ThinkingScratchpad';
import { AIEditingStatusIndicator } from './FileEditingIndicator';
import { VizChatMessage } from '@vizhub/viz-types';
import { ExtendedVizChatMessage } from '../../../types.js';

const MessageListComponent = ({
  messages,
  isLoading,
  chatId, // Add chatId prop
  aiScratchpad, // Add aiScratchpad prop
  currentStatus, // Add current status prop
}: {
  messages: VizChatMessage[];
  isLoading: boolean;
  chatId?: string; // Add chatId to the type
  aiScratchpad?: string; // Add aiScratchpad to the type
  currentStatus?: string; // Add current status to the type
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

  // Determine the single, most relevant status to display with priority:
  // 1. Active file editing status from streaming events
  // 2. General AI status from currentStatus
  const getConsolidatedStatus = () => {
    // Check if there's an active streaming message with file editing
    if (lastMessage && lastMessage.role === 'assistant') {
      const extendedMsg =
        lastMessage as ExtendedVizChatMessage;
      if (
        extendedMsg.streamingEvents &&
        extendedMsg.streamingEvents.length > 0
      ) {
        // Look for active file editing (file_start without corresponding file_complete)
        const fileStates = new Map<string, boolean>();

        extendedMsg.streamingEvents.forEach((event) => {
          if (event.type === 'file_start') {
            fileStates.set(event.fileName, false); // Mark as editing
          } else if (event.type === 'file_complete') {
            fileStates.set(event.fileName, true); // Mark as complete
          }
        });

        // Find the first file that's still being edited
        for (const [fileName, isComplete] of fileStates) {
          if (!isComplete) {
            return {
              status: `Editing ${fileName}...`,
              fileName,
            };
          }
        }
      }
    }

    // Fall back to general AI status if no active file editing
    if (currentStatus) {
      return { status: currentStatus };
    }

    return null;
  };

  const consolidatedStatus = getConsolidatedStatus();

  // Show consolidated status indicator when there's a status to display
  const showConsolidatedStatusIndicator = Boolean(
    consolidatedStatus,
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
        // Cast to extended message to check for streaming events
        const extendedMsg = msg as ExtendedVizChatMessage;

        // Check if this is a streaming message
        const isStreamingMessage =
          !!extendedMsg.isProgressive;

        // Only show additionalWidgets for the most recent assistant message
        const showAdditionalWidgets =
          msg.role === 'assistant' &&
          index === lastAssistantMessageIndex;

        // Use StreamingMessage for assistant messages with streaming events
        if (
          msg.role === 'assistant' &&
          isStreamingMessage
        ) {
          return (
            <StreamingMessage
              key={msg.id}
              timestamp={msg.timestamp}
              events={extendedMsg.streamingEvents || []}
              isActive={index === lastAssistantMessageIndex}
            >
              {showThinkingScratchpad && (
                <ThinkingScratchpad
                  content={aiScratchpad || ''}
                  isVisible={showThinkingScratchpad}
                />
              )}

              {showConsolidatedStatusIndicator && (
                <AIEditingStatusIndicator
                  status={consolidatedStatus?.status || ''}
                  fileName={consolidatedStatus?.fileName}
                />
              )}

              {showTypingIndicator && <TypingIndicator />}
            </StreamingMessage>
          );
        }

        // Use regular Message component for user messages and non-streaming assistant messages
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

      <div ref={messagesEndRef} />
    </div>
  );
};

export const MessageList = memo(MessageListComponent);
