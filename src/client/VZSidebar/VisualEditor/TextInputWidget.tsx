import React from 'react';

interface TextInputWidgetProps {
  property: string;
  label: string;
  currentValue: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

export const TextInputWidget: React.FC<
  TextInputWidgetProps
> = ({ property, label, currentValue, onChange }) => {
  return (
    <div className="visual-editor-text-input">
      <div className="text-input-header">
        <label
          htmlFor={property}
          className="text-input-label"
        >
          {label}
        </label>
      </div>
      <div className="text-input-container">
        <input
          type="text"
          id={property}
          className="text-input-field"
          value={currentValue || ''}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
