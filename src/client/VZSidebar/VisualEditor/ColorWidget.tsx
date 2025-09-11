import React, { useRef, useEffect } from 'react';
import { renderSliderBackground } from './utils';

interface ColorWidgetProps {
  property: string;
  label: string;
  currentHex: string;
  currentH: number;
  currentC: number;
  currentL: number;
  onColorChange: (
    property: string,
    lchComponent: 'l' | 'c' | 'h',
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ColorWidget: React.FC<ColorWidgetProps> = ({
  property,
  label,
  currentHex,
  currentH,
  currentC,
  currentL,
  onColorChange,
}) => {
  // Refs for canvas elements (for color slider backgrounds)
  const canvasRefs = useRef<{
    [key: string]: HTMLCanvasElement | null;
  }>({});

  // Update color slider backgrounds when values change
  useEffect(() => {
    const values = {
      h: currentH,
      c: currentC,
      l: currentL,
    };

    // Render backgrounds for each slider
    renderSliderBackground(
      canvasRefs.current[`${property}_l_bg`],
      'l',
      values,
    );
    renderSliderBackground(
      canvasRefs.current[`${property}_c_bg`],
      'c',
      values,
    );
    renderSliderBackground(
      canvasRefs.current[`${property}_h_bg`],
      'h',
      values,
    );
  }, [property, currentH, currentC, currentL]);

  return (
    <div className="visual-editor-color">
      <div className="color-header">
        <label className="color-label">{label}</label>
        <span className="color-value">{currentHex}</span>
      </div>

      <div
        className="color-preview"
        style={{ backgroundColor: currentHex }}
      />

      <div className="lch-sliders">
        {/* Lightness Slider */}
        <div className="lch-slider">
          <div className="slider-header">
            <label className="slider-label">
              Lightness
            </label>
            <span className="slider-value">
              {Math.round(currentL)}
            </span>
          </div>
          <div className="slider-container">
            <canvas
              ref={(canvas) => {
                canvasRefs.current[`${property}_l_bg`] =
                  canvas;
              }}
              className="slider-bg-canvas"
              width={200}
            />
            <input
              type="range"
              className="slider-input"
              min={0}
              max={100}
              step={1}
              value={currentL}
              onChange={onColorChange(property, 'l')}
            />
          </div>
          <div className="slider-bounds">
            <span className="min-value">0</span>
            <span className="max-value">100</span>
          </div>
        </div>

        {/* Chroma Slider */}
        <div className="lch-slider">
          <div className="slider-header">
            <label className="slider-label">Chroma</label>
            <span className="slider-value">
              {Math.round(currentC)}
            </span>
          </div>
          <div className="slider-container">
            <canvas
              ref={(canvas) => {
                canvasRefs.current[`${property}_c_bg`] =
                  canvas;
              }}
              className="slider-bg-canvas"
              width={200}
            />
            <input
              type="range"
              className="slider-input"
              min={0}
              max={100}
              step={1}
              value={currentC}
              onChange={onColorChange(property, 'c')}
            />
          </div>
          <div className="slider-bounds">
            <span className="min-value">0</span>
            <span className="max-value">100</span>
          </div>
        </div>

        {/* Hue Slider */}
        <div className="lch-slider">
          <div className="slider-header">
            <label className="slider-label">Hue</label>
            <span className="slider-value">
              {Math.round(currentH)}°
            </span>
          </div>
          <div className="slider-container">
            <canvas
              ref={(canvas) => {
                canvasRefs.current[`${property}_h_bg`] =
                  canvas;
              }}
              className="slider-bg-canvas"
              width={200}
            />
            <input
              type="range"
              className="slider-input"
              min={0}
              max={360}
              step={1}
              value={currentH}
              onChange={onColorChange(property, 'h')}
            />
          </div>
          <div className="slider-bounds">
            <span className="min-value">0°</span>
            <span className="max-value">360°</span>
          </div>
        </div>
      </div>
    </div>
  );
};
