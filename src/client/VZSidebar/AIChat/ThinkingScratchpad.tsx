import {
  memo,
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { JumpToLatestButton } from './JumpToLatestButton';
import { useAutoScroll } from '../../hooks/useAutoScroll';

interface ThinkingScratchpadProps {
  content: string;
  isVisible: boolean;
}

const ThinkingScratchpadComponent = ({
  content,
  isVisible,
}: ThinkingScratchpadProps) => {
  // Use the new simplified auto-scroll hook
  const {
    containerRef: contentRef,
    autoScrollState,
    showJumpButton,
    onNewEvent,
    onJumpToLatest,
    beforeRender,
    afterRender,
  } = useAutoScroll({ threshold: 24 });

  // Auto-scroll when content changes and component is visible
  useEffect(() => {
    if (isVisible && content) {
      // Get scroll height before render for anchoring
      const prevScrollHeight = beforeRender();

      // Trigger auto-scroll if enabled
      onNewEvent();

      // Adjust scroll position after render for anchoring
      afterRender(prevScrollHeight);
    }
  }, [
    content,
    isVisible,
    onNewEvent,
    beforeRender,
    afterRender,
  ]);

  // Reset scroll state when component becomes visible
  useEffect(() => {
    if (isVisible) {
      // Jump to latest when scratchpad becomes visible
      onJumpToLatest();
    }
  }, [isVisible, onJumpToLatest]);

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
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        style={{ position: 'relative' }}
      >
        <Markdown remarkPlugins={[remarkGfm]}>
          {content}
        </Markdown>

        {/* Jump to Latest Button */}
        <JumpToLatestButton
          visible={showJumpButton}
          onClick={onJumpToLatest}
        />
      </div>
    </div>
  );
};

export const ThinkingScratchpad = memo(
  ThinkingScratchpadComponent,
);
