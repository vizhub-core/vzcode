// Import the SCSS styles defined in 'style.scss'
import './style.scss';

// Import necessary elements from React, including the useState hook
import React, { useState } from 'react';

// Define a React functional component named 'PrettierErrorOverlay' that accepts a 'prettierError' prop
export const PrettierErrorOverlay = ({ prettierError }) => {
  // Define a state variable 'editorHeight' using the 'useState' hook, with an initial height of 200 pixels
  const [editorHeight, setEditorHeight] = useState(200);

  // Define an event handler function 'handleResizeStart' that triggers when the user clicks and holds the mouse button
  const handleResizeStart = (e) => {
    // Capture the starting vertical position of the mouse
    let startY = e.clientY;

    // Define an event handler function 'handleResize' that calculates the new height while the user is dragging
    const handleResize = (e) => {
      // Calculate the new height based on the initial height and the vertical movement of the mouse
      const newHeight = editorHeight + (e.clientY - startY);

      // Ensure the new height is greater than or equal to 100 pixels to prevent excessive shrinking
      if (newHeight >= 100) {
        setEditorHeight(newHeight);
      }

      // Update the starting position for the next calculation
      startY = e.clientY;
    };

    // Define an event handler function 'handleResizeEnd' that executes when the user releases the mouse button
    const handleResizeEnd = () => {
      // Remove the event listeners for mouse movement and mouse button release
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    // Add event listeners to the 'document' element to track mouse movement and button release while resizing
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // Conditionally render content based on whether the 'prettierError' prop is not null
  return prettierError !== null ? (
    <div className="editor-container">
      {/* Button element with ID 'resize-button' triggers 'handleResizeStart' on mouse down */}
      <button
        id="resize-button"
        onMouseDown={handleResizeStart}
      >
        Resize
      </button>
      {/* Div element with class 'editor' that displays content with a dynamic height based on 'editorHeight' */}
      <div className="editor" style={{ height: editorHeight + 'px' }}>
        {prettierError}
      </div>
    </div>
  ) : null; // If 'prettierError' is null, render nothing
};

