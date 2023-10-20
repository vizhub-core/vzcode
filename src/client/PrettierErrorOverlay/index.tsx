import './style.scss';

import React, { useState } from 'react';

export const PrettierErrorOverlay = ({ prettierError }) => {
  const [editorHeight, setEditorHeight] = useState(200); // Initial height

  const handleResizeStart = (e) => {
    let startY = e.clientY;

    const handleResize = (e) => {
      const newHeight = editorHeight + (e.clientY - startY);

      if (newHeight >= 100) {
        setEditorHeight(newHeight);
      }

      startY = e.clientY;
    };

    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  return prettierError !== null ? (
    <div className="editor-container">
      <button
        id="resize-button"
        onMouseDown={handleResizeStart}
      >
        Resize
      </button>
      <div className="editor" style={{ height: editorHeight + 'px' }}>
        {prettierError}
      </div>
    </div>
  ) : null;
};
