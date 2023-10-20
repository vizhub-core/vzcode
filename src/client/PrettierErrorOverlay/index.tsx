// Import the SCSS styles defined in 'style.scss'
import './style.scss';

// Import necessary elements from React, including the useState hook
import React, { useState } from 'react';

// Define a React functional component named 'PrettierErrorOverlay' that accepts a 'prettierError' prop
export const PrettierErrorOverlay = ({ prettierError }) => {
  // Define a state variable 'isOpen' using the 'useState' hook, with an initial value of 'false'
  const [isOpen, setIsOpen] = useState(false);

  // Define an event handler function 'toggleEditor' that toggles the 'isOpen' state
  const toggleEditor = () => {
    setIsOpen(!isOpen); // Toggle the value of 'isOpen'
  };

  // Return the JSX content to be rendered
  return (
    <div className="editor-container">
      {/* Button element with ID 'toggle-button' triggers 'toggleEditor' function on click */}
      <button
        id="toggle-button"
        onClick={toggleEditor}
      >
        {isOpen ? 'Close' : 'Open'} Editor
      </button>
      {/* Div element with dynamic classes based on 'isOpen' state */}
      <div className={`prettier-error-overlay${isOpen ? '' : ' hidden'}`}>
        {prettierError}
      </div>
    </div>
  );
};
