import {
  memo,
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ThinkingScratchpadProps {
  content: string;
  isVisible: boolean;
}

const ThinkingScratchpadComponent = ({
  content,
  isVisible,
}: ThinkingScratchpadProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isUserScrolled, setIsUserScrolled] =
    useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] =
    useState(true);
  const scrollTimeoutRef =
    useRef<ReturnType<typeof setTimeout>>();

  // Check if the user is scrolled to the bottom
  const isScrolledToBottom = useCallback(() => {
    const container = contentRef.current;
    if (!container) return true;

    const threshold = 10; // Allow 10px tolerance for "at bottom"
    const { scrollTop, scrollHeight, clientHeight } =
      container;
    return (
      scrollHeight - scrollTop - clientHeight < threshold
    );
  }, []);

  // Smooth scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (!autoScrollEnabled) return;

    const container = contentRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [autoScrollEnabled]);

  // Handle scroll events to detect user manual scrolling
  const handleScroll = useCallback(() => {
    const container = contentRef.current;
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
      }, 300); // 300ms delay to prevent flickering
    }
  }, [isUserScrolled, isScrolledToBottom]);

  // Auto-scroll when content changes, but only if auto-scroll is enabled
  useEffect(() => {
    if (
      autoScrollEnabled &&
      !isUserScrolled &&
      isVisible &&
      content
    ) {
      // Use a short debounce to prevent multiple scroll calls during rapid updates
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        scrollToBottom();
      }, 50); // 50ms debounce
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [
    content,
    autoScrollEnabled,
    isUserScrolled,
    isVisible,
    scrollToBottom,
  ]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Reset scroll state when component becomes visible
  useEffect(() => {
    if (isVisible) {
      setIsUserScrolled(false);
      setAutoScrollEnabled(true);
    }
  }, [isVisible]);

  if (!isVisible || !content) {
    return null;
  }

  return (
    <div className="thinking-scratchpad">
      <div className="thinking-scratchpad-header">
        <span className="thinking-scratchpad-icon">🧠</span>
        <span className="thinking-scratchpad-title">
          AI is thinking...
        </span>
      </div>
      <div
        className="thinking-scratchpad-content"
        ref={contentRef}
        onScroll={handleScroll}
      >
        <Markdown remarkPlugins={[remarkGfm]}>
          {content}
        </Markdown>
      </div>
    </div>
  );
};

export const ThinkingScratchpad = memo(
  ThinkingScratchpadComponent,
);
