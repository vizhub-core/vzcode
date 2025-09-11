import React from 'react';
import { calculatePercentage, formatValue } from './utils';

interface SliderWidgetProps {
  property: string;
  label: string;
  min: number;
  max: number;
  step: number;
  currentValue: number;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

export const SliderWidget: React.FC<SliderWidgetProps> = ({
  property,
  label,
  min,
  max,
  step,
  currentValue,
  onChange,
}) => {
  const percentage = calculatePercentage(
    currentValue,
    min,
    max,
  );

  return (
    <div className="visual-editor-slider">
      <div className="slider-header">
        <label htmlFor={property} className="slider-label">
          {label}
        </label>
        <span className="slider-value">
          {formatValue(currentValue, min, max)}
        </span>
      </div>
      <div className="slider-container">
        <input
          type="range"
          id={property}
          className="slider-input"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={onChange}
        />
        <div
          className="slider-track-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="slider-bounds">
        <span className="min-value">{min}</span>
        <span className="max-value">{max}</span>
      </div>
    </div>
  );
};
