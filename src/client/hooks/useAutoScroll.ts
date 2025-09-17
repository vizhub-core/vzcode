import {
  useRef,
  useCallback,
  useState,
  useEffect,
} from 'react';

/**
 * Auto-scroll state machine with simplified states
 */
type AutoScrollState = 'AUTO_SCROLL_ON' | 'AUTO_SCROLL_OFF';

/**
 * Hook options for customizing behavior
 */
interface UseAutoScrollOptions {
  /** Threshold for "at bottom" detection in pixels (default: 24) */
  threshold?: number;
}

/**
 * Hook return type with methods and state
 */
interface UseAutoScrollReturn {
  /** Ref to attach to the scrollable container */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Current auto-scroll state */
  autoScrollState: AutoScrollState;
  /** Whether to show the "jump to latest" button */
  showJumpButton: boolean;
  /** Function to handle new content/events */
  onNewEvent: (targetElement?: HTMLElement) => void;
  /** Function to handle user clicking jump to latest button */
  onJumpToLatest: (targetElement?: HTMLElement) => void;
  /** Function to call before rendering new content (for anchoring) */
  beforeRender: () => number;
  /** Function to call after rendering new content (for anchoring) */
  afterRender: (prevScrollHeight: number) => void;
}

/**
 * Simplified auto-scroll hook implementing the state machine from the issue
 *
 * States: AUTO_SCROLL_ON, AUTO_SCROLL_OFF
 * Transitions:
 * - onNewEvent: if AUTO_SCROLL_ON → scrollToBottom(), if AUTO_SCROLL_OFF → no scroll
 * - onUserScroll: if isAtBottom(el) → AUTO_SCROLL_ON; hide button, else → AUTO_SCROLL_OFF; show button
 * - onJumpToLatestClick → AUTO_SCROLL_ON + scrollToBottom(); hide button
 */
export const useAutoScroll = (
  options: UseAutoScrollOptions = {},
): UseAutoScrollReturn => {
  const { threshold = 24 } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScrollState, setAutoScrollState] =
    useState<AutoScrollState>('AUTO_SCROLL_ON');
  const [showJumpButton, setShowJumpButton] =
    useState(false);
  const rafIdRef = useRef<number>();

  /**
   * Check if the container is at the bottom
   */
  const isAtBottom = useCallback(
    (el: HTMLElement): boolean => {
      return (
        el.scrollHeight - el.clientHeight - el.scrollTop <=
        threshold
      );
    },
    [threshold],
  );

  /**
   * Update jump button visibility
   */
  const updateJumpButtonVisibility = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      setShowJumpButton(false);
      return;
    }

    // Only show when AUTO_SCROLL_OFF AND not at bottom
    const shouldShow =
      autoScrollState === 'AUTO_SCROLL_OFF' &&
      !isAtBottom(container);
    setShowJumpButton(shouldShow);
  }, [autoScrollState, isAtBottom]);

  /**
   * Scroll the container to a target element or to the bottom
   */
  const scrollToTargetOrBottom = useCallback(
    (
      el: HTMLElement,
      targetElement?: HTMLElement,
    ): void => {
      if (targetElement) {
        // Scroll to a specific element within the container
        const containerRect = el.getBoundingClientRect();
        const targetRect =
          targetElement.getBoundingClientRect();
        const scrollTop =
          targetRect.top - containerRect.top + el.scrollTop;

        // We can add an offset if needed, e.g., for headers
        const offset = 0;

        el.scrollTop = scrollTop - offset;
      } else {
        // Scroll to the bottom of the container
        el.scrollTop = el.scrollHeight;
      }
    },
    [],
  );

  /**
   * Handle scroll events to detect user manual scrolling
   */
  const handleScroll = useCallback(() => {
    console.log('handleScroll called');
    const container = containerRef.current;
    if (!container) return;

    if (isAtBottom(container)) {
      // User scrolled back to bottom - enable auto-scroll and hide button
      setAutoScrollState('AUTO_SCROLL_ON');
    } else {
      // User scrolled up - disable auto-scroll and show button
      setAutoScrollState('AUTO_SCROLL_OFF');
    }
  }, [isAtBottom]);

  /**
   * Attach scroll listener to container
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  /**
   * Update jump button visibility when state changes
   */
  useEffect(() => {
    updateJumpButtonVisibility();
  }, [updateJumpButtonVisibility]);

  /**
   * Handle new event/message render
   */
  const onNewEvent = useCallback(
    (targetElement?: HTMLElement) => {
      if (autoScrollState === 'AUTO_SCROLL_ON') {
        // Use requestAnimationFrame for batched updates
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }

        rafIdRef.current = requestAnimationFrame(() => {
          const container = containerRef.current;
          if (container) {
            scrollToTargetOrBottom(
              container,
              targetElement,
            );
          }
        });
      }
      // If AUTO_SCROLL_OFF, do nothing (no scroll)
    },
    [autoScrollState, scrollToTargetOrBottom],
  );

  /**
   * Handle jump to latest button click
   */
  const onJumpToLatest = useCallback(
    (targetElement?: HTMLElement) => {
      const container = containerRef.current;
      if (!container) return;

      // Set state to AUTO_SCROLL_ON and scroll to target or bottom
      setAutoScrollState('AUTO_SCROLL_ON');
      scrollToTargetOrBottom(container, targetElement);
    },
    [scrollToTargetOrBottom],
  );

  /**
   * Get scroll height before rendering (for anchoring)
   */
  const beforeRender = useCallback((): number => {
    const container = containerRef.current;
    return container ? container.scrollHeight : 0;
  }, []);

  /**
   * Adjust scroll position after rendering (for anchoring when OFF)
   */
  const afterRender = useCallback(
    (prevScrollHeight: number) => {
      if (autoScrollState === 'AUTO_SCROLL_OFF') {
        const container = containerRef.current;
        if (container) {
          const delta =
            container.scrollHeight - prevScrollHeight;
          container.scrollTop += delta; // anchor view
        }
      }
    },
    [autoScrollState],
  );

  /**
   * Clean up animation frame on unmount
   */
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    autoScrollState,
    showJumpButton,
    onNewEvent,
    onJumpToLatest,
    beforeRender,
    afterRender,
  };
};
