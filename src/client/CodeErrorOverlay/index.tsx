import { useState, useCallback, useEffect } from 'react';
import './style.scss';

const enableErrorDismiss = true;

export const CodeErrorOverlay = ({
  errorMessage,
}: {
  errorMessage: string | null;
}) => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);

  // If errorMessage changes, set the overlay to be visible
  useEffect(() => {
    if (errorMessage !== null) {
      setIsOverlayVisible(true);
    }
  }, [errorMessage]);

  useEffect(() => {
    document.addEventListener("keydown", detectKeyDown, true);

    return () => {
      // Remove the event listener when the component unmounts
      document.removeEventListener("keydown", detectKeyDown, true);
    };
  }, []);

  const detectKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCloseClick();
    }
  }

  const handleCloseClick = useCallback(() => {
    // Set the visibility state to false when the button is clicked
    setIsOverlayVisible(false);
  }, []);

  return isOverlayVisible && errorMessage !== null ? (
    <div className="vz-code-error-overlay">
      <pre>{errorMessage}</pre>
      {enableErrorDismiss ? (
        <div
          className={'bx bx-x error-dismiss-button'}
          onClick={handleCloseClick}
        ></div>
      ) : null}
    </div>
  ) : null;
};
