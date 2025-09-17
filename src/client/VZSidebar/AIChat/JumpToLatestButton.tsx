import React, { useCallback } from 'react';

/**
 * Props for the JumpToLatestButton component
 */
interface JumpToLatestButtonProps {
  /** Whether the button is visible */
  visible: boolean;
  /** Callback when button is clicked */
  onClick: () => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Circular "down arrow" button that floats at the bottom center of scroll area
 * Appears when auto-scroll is disabled and user is not at bottom
 */
export const JumpToLatestButton: React.FC<
  JumpToLatestButtonProps
> = ({ visible, onClick, className = '' }) => {
  /**
   * Handle button click
   */
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  /**
   * Handle keyboard events for accessibility
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    },
    [onClick],
  );

  if (!visible) {
    return null;
  }

  return (
    <button
      className={`jump-to-latest-button ${className}`.trim()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="Jump to latest"
      tabIndex={0}
      type="button"
    >
      {/* Down arrow icon using Unicode or can be replaced with SVG */}
      <span
        className="jump-to-latest-icon"
        aria-hidden="true"
      >
        ▼
      </span>
    </button>
  );
};
