import React from 'react';

interface DropdownWidgetProps {
  property: string;
  label: string;
  options: string[];
  currentValue: string;
  isOpen: boolean;
  onToggle: () => void;
  onOptionClick: (value: string) => void;
}

export const DropdownWidget: React.FC<
  DropdownWidgetProps
> = ({
  property,
  label,
  options,
  currentValue,
  isOpen,
  onToggle,
  onOptionClick,
}) => {
  return (
    <div className="visual-editor-dropdown">
      <div className="dropdown-header">
        <label
          htmlFor={property}
          className="dropdown-label"
        >
          {label}
        </label>
      </div>
      <div className="dropdown-container">
        <button
          type="button"
          className={`dropdown-button ${isOpen ? 'open' : ''}`}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="dropdown-button-text">
            {currentValue}
          </span>
          <div
            className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          >
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
        {isOpen && (
          <div className="dropdown-options">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`dropdown-option ${
                  option === currentValue ? 'selected' : ''
                }`}
                onClick={() => onOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
