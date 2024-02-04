import { useState, useCallback, useEffect } from 'react';
import { VZCodeContent } from '../../types';
import { XSVG } from '../Icons';
import './style.scss';

const enableErrorDismiss = true;

export const CodeErrorOverlay = ({
  errorMessage,
  content,
}: {
  errorMessage: string | null;
  content: VZCodeContent;
}) => {
  const [isOverlayVisible, setIsOverlayVisible] =
    useState(true);

  // If errorMessage changes, set the overlay to be visible
  useEffect(() => {
    if (errorMessage !== null) {
      setIsOverlayVisible(true);
    }
  }, [errorMessage]);

  // If the content changes, set the overlay to be not visible.
  useEffect(() => {
    setIsOverlayVisible(false);
  }, [content]);

  // Set the visibility state to false when the button is clicked
  const handleCloseClick = useCallback(() => {
    setIsOverlayVisible(false);
  }, []);

  // If the user presses the escape key, close the overlay.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseClick();
      }
    };
    document.addEventListener(
      'keydown',
      handleKeyDown,
      true,
    );

    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
        true,
      );
    };
  }, [handleCloseClick]);

  return isOverlayVisible && errorMessage !== null ? (
    <div className="vz-code-error-overlay">
      <pre>{errorMessage}</pre>
      {enableErrorDismiss ? (
        <i
          className="icon-button icon-button-dark error-dismiss-button"
          onClick={handleCloseClick}
        >
          <XSVG />
        </i>
      ) : null}
    </div>
  ) : null;
};
