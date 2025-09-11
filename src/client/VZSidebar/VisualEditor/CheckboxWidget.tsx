import React from 'react';

interface CheckboxWidgetProps {
  property: string;
  label: string;
  currentValue: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

export const CheckboxWidget: React.FC<
  CheckboxWidgetProps
> = ({ property, label, currentValue, onChange }) => {
  return (
    <div className="visual-editor-checkbox">
      <div className="checkbox-header">
        <label
          htmlFor={property}
          className="checkbox-label"
        >
          {label}
        </label>
        <span className="checkbox-value">
          {currentValue ? 'On' : 'Off'}
        </span>
      </div>
      <div className="checkbox-container">
        <input
          type="checkbox"
          id={property}
          className="checkbox-input"
          checked={currentValue}
          onChange={onChange}
        />
        <div className="checkbox-visual">
          <div
            className={`checkbox-indicator ${
              currentValue ? 'checked' : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
};
