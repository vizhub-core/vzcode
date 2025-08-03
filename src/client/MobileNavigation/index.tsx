import { useState, useEffect } from 'react';
import './style.scss';

export type MobileView = 'files' | 'editor' | 'preview';

interface MobileNavigationProps {
  currentView: MobileView;
  onViewChange: (view: MobileView) => void;
  hasOpenFile: boolean;
}

export const MobileNavigation = ({
  currentView,
  onViewChange,
  hasOpenFile,
}: MobileNavigationProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (!isMobile) {
    return null;
  }

  return (
    <div className="mobile-navigation">
      <button
        className={`mobile-nav-btn ${currentView === 'files' ? 'active' : ''}`}
        onClick={() => onViewChange('files')}
        aria-label="Files and AI Chat"
      >
        <span className="mobile-nav-icon">📁</span>
        <span className="mobile-nav-label">Files</span>
      </button>

      {hasOpenFile && (
        <button
          className={`mobile-nav-btn ${currentView === 'editor' ? 'active' : ''}`}
          onClick={() => onViewChange('editor')}
          aria-label="Code Editor"
        >
          <span className="mobile-nav-icon">✏️</span>
          <span className="mobile-nav-label">Editor</span>
        </button>
      )}

      <button
        className={`mobile-nav-btn ${currentView === 'preview' ? 'active' : ''}`}
        onClick={() => onViewChange('preview')}
        aria-label="Preview"
      >
        <span className="mobile-nav-icon">👁️</span>
        <span className="mobile-nav-label">Preview</span>
      </button>
    </div>
  );
};
