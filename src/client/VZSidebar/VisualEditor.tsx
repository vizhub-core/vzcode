import {
  useCallback,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { VZCodeContext } from '../VZCodeContext';
import { VizContent, VizFileId } from '@vizhub/viz-types';
import { VisualEditorConfigEntry } from '../../types';
import { EmptyState } from './EmptyState';
import {color, hcl, HCLColor, rgb}  from 'd3-color';

const CONFIG_FILE_NAME = 'config.json';

// Helper function to calculate percentage for progress fill
const calculatePercentage = (
  value: number,
  min: number,
  max: number,
) => {
  return ((value - min) / (max - min)) * 100;
};

// Helper function to format values nicely
const formatValue = (
  value: number,
  min: number,
  max: number,
) => {
  // Determine decimal places based on the range
  const range = max - min;
  const decimalPlaces =
    range < 10 ? 2 : range < 100 ? 1 : 0;
  return Number(value).toFixed(decimalPlaces);
};

export const VisualEditor = () => {
  const { files, submitOperation } =
    useContext(VZCodeContext);

  // Local state to track widget values during user interaction
  const [localValues, setLocalValues] = useState<{
    [key: string]: number | boolean | string;
  }>({});

  // State to track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState<
    string | null
  >(null);

  let configFileId: VizFileId | null = null;
  for (const fileId in files) {
    if (files[fileId].name === CONFIG_FILE_NAME) {
      configFileId = fileId;
      break;
    }
  }

  const configData = useMemo(() => {
    try {
      return JSON.parse(files[configFileId].text);
    } catch (_error) {
      console.error('Error parsing config.json:', _error);
      return null;
    }
  }, [files?.[configFileId]?.text]);

  const onSliderChange = useCallback(
    (property: string) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(
          event.currentTarget.value,
        );

        // Update local state immediately for responsive UI
        setLocalValues((prev) => ({
          ...prev,
          [property]: newValue,
        }));

        // Update config.json
        const newConfigData = {
          ...configData,
          [property]: newValue,
        };

        submitOperation((document: VizContent) => ({
          ...document,
          files: {
            ...files,
            [configFileId]: {
              name: 'config.json',
              text: JSON.stringify(newConfigData, null, 2),
            },
          },
        }));
      },
    [configData, files, configFileId, setLocalValues],
  );

  const onCheckboxChange = useCallback(
    (property: string) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.checked;

        // Update local state immediately for responsive UI
        setLocalValues((prev) => ({
          ...prev,
          [property]: newValue,
        }));

        // Update config.json
        const newConfigData = {
          ...configData,
          [property]: newValue,
        };

        submitOperation((document: VizContent) => ({
          ...document,
          files: {
            ...files,
            [configFileId]: {
              name: 'config.json',
              text: JSON.stringify(newConfigData, null, 2),
            },
          },
        }));
      },
    [configData, files, configFileId, setLocalValues],
  );

  const onTextInputChange = useCallback(
    (property: string) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.value;

        // Update local state immediately for responsive UI
        setLocalValues((prev) => ({
          ...prev,
          [property]: newValue,
        }));

        // Update config.json
        const newConfigData = {
          ...configData,
          [property]: newValue,
        };

        submitOperation((document: VizContent) => ({
          ...document,
          files: {
            ...files,
            [configFileId]: {
              name: 'config.json',
              text: JSON.stringify(newConfigData, null, 2),
            },
          },
        }));
      },
    [configData, files, configFileId, setLocalValues],
  );

  const onDropdownChange = useCallback(
    (property: string, newValue: string) => {
      // Update local state immediately for responsive UI
      setLocalValues((prev) => ({
        ...prev,
        [property]: newValue,
      }));

      // Update config.json
      const newConfigData = {
        ...configData,
        [property]: newValue,
      };

      submitOperation((document: VizContent) => ({
        ...document,
        files: {
          ...files,
          [configFileId]: {
            name: 'config.json',
            text: JSON.stringify(newConfigData, null, 2),
          },
        },
      }));
    },
    [configData, files, configFileId, setLocalValues],
  );

  // Custom dropdown handlers
  const handleDropdownToggle = useCallback(
    (property: string) => {
      setOpenDropdown((prev) =>
        prev === property ? null : property,
      );
    },
    [],
  );

  const handleDropdownOptionClick = useCallback(
    (property: string, value: string) => {
      onDropdownChange(property, value);
      setOpenDropdown(null);
    },
    [onDropdownChange],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        const target = event.target as Element;
        if (!target.closest('.visual-editor-dropdown')) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    );
    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      );
    };
  }, [openDropdown]);

  const onColorChange = useCallback(
    (property: string, lchComponent: 'l' | 'c' | 'h') =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(
          event.currentTarget.value,
        );

        // Get current hex color from config
        const currentHex =
          configData[property] || '#000000';

        // Convert current hex to LCH
        let hclFromRGB: HCLColor;
        try {
          const rgbColor = rgb(currentHex);
          hclFromRGB = hcl(rgbColor);
        } catch (error) {
          // Fallback to black if conversion fails
          hclFromRGB = hcl('black');
        }

        let hclArray: number[] = [
          (localValues[`${property}_h`] as number) ??
            hclFromRGB.h,
          (localValues[`${property}_c`] as number) ??
            hclFromRGB.c,
          (localValues[`${property}_l`] as number) ??
            hclFromRGB.l,
        ];


        // Update the specific LCH component
        const newhcl = [...hclArray];
        if (lchComponent === 'h') newhcl[0] = newValue;
        else if (lchComponent === 'c') newhcl[1] = newValue;
        else if (lchComponent === 'l') newhcl[2] = newValue;

        // Convert back to hex
        let newHex;
        try {
          const newColor = hcl(
            newhcl[0],
            newhcl[1],
            newhcl[2],
          );

          if (newColor.displayable()) {
            newHex = newColor.formatHex();
          }
          else{
            newHex = currentHex;
          }
        } catch (error) {
          // Fallback to current color if conversion fails
          newHex = currentHex;
        }

        // Update local state for responsive UI
        setLocalValues((prev) => ({
          ...prev,
          [property]: newHex,
          [`${property}_h`]: newhcl[0],
          [`${property}_c`]: newhcl[1],
          [`${property}_l`]: newhcl[2],
        }));

        // Update config.json with hex value
        const newConfigData = {
          ...configData,
          [property]: newHex,
        };

        submitOperation((document: VizContent) => ({
          ...document,
          files: {
            ...files,
            [configFileId]: {
              name: 'config.json',
              text: JSON.stringify(newConfigData, null, 2),
            },
          },
        }));
      },
    [configData, files, configFileId, setLocalValues],
  );

  const visualEditorWidgets: VisualEditorConfigEntry[] =
    configData?.visualEditorWidgets ?? [];

  // Sync local values with config data when it changes (including remote updates)
  useEffect(() => {
    const newLocalValues: {
      [key: string]: number | boolean | string;
    } = {};
    visualEditorWidgets.forEach((widget) => {
      if (widget.type === 'slider') {
        newLocalValues[widget.property] =
          configData[widget.property];
      } else if (widget.type === 'checkbox') {
        newLocalValues[widget.property] =
          configData[widget.property];
      } else if (widget.type === 'textInput') {
        newLocalValues[widget.property] =
          configData[widget.property];
      } else if (widget.type === 'dropdown') {
        newLocalValues[widget.property] =
          configData[widget.property];
      } else if (widget.type === 'color') {
        newLocalValues[widget.property] =
          configData[widget.property];

        // Convert hex to LCH for internal state
        const hexColor = configData[widget.property];

        if (localValues[widget.property] !== hexColor) {
          if (hexColor) {
            try {
              const rgbColor = color(hexColor);
              const lch = hcl(rgbColor);
              newLocalValues[`${widget.property}_h`] =
              lch.h;
              newLocalValues[`${widget.property}_c`] =
              lch.c;
              newLocalValues[`${widget.property}_l`] =
              lch.l;
            } catch (error) {
              // Fallback values if conversion fails
              newLocalValues[`${widget.property}_l`] = 0;
              newLocalValues[`${widget.property}_c`] = 0;
              newLocalValues[`${widget.property}_h`] = 0;
            }
          }
        }
      }
    });
    setLocalValues(newLocalValues);
  }, [configData]);

  if (configFileId === null) {
    return (
      <EmptyState>
        To begin using the visual editor, create a
        config.json.
      </EmptyState>
    );
  }

  if (!configData) {
    return (
      <EmptyState>
        Your config.json file is not valid json.
      </EmptyState>
    );
  }

  if (
    configData &&
    !('visualEditorWidgets' in configData)
  ) {
    return (
      <EmptyState>
        To begin using the visual editor, make sure your
        config.json has a key called "visualEditorWidgets",
        whose value is the config for the visual editor.
      </EmptyState>
    );
  }

  if (
    configData &&
    !Array.isArray(configData.visualEditorWidgets)
  ) {
    return (
      <EmptyState>
        Your config.json file has "visualEditorWidgets" but
        it is not an array. Please make sure
        "visualEditorWidgets" is an array of widget
        configurations.
      </EmptyState>
    );
  }

  return (
    <div className="visual-editor">
      {visualEditorWidgets.map((widgetConfig, _index) => {
        if (widgetConfig.type === 'slider') {
          // Use local value if available, otherwise fall back to config value
          const currentValue =
            localValues[widgetConfig.property] ??
            configData[widgetConfig.property];
          const percentage = calculatePercentage(
            currentValue,
            widgetConfig.min,
            widgetConfig.max,
          );

          return (
            <div
              key={widgetConfig.property}
              className="visual-editor-slider"
            >
              <div className="slider-header">
                <label
                  htmlFor={widgetConfig.property}
                  className="slider-label"
                >
                  {widgetConfig.label}
                </label>
                <span className="slider-value">
                  {formatValue(
                    currentValue,
                    widgetConfig.min,
                    widgetConfig.max,
                  )}
                </span>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  id={widgetConfig.property}
                  className="slider-input"
                  min={widgetConfig.min}
                  max={widgetConfig.max}
                  step={widgetConfig.step}
                  value={currentValue}
                  onChange={onSliderChange(
                    widgetConfig.property,
                  )}
                />
                <div
                  className="slider-track-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="slider-bounds">
                <span className="min-value">
                  {widgetConfig.min}
                </span>
                <span className="max-value">
                  {widgetConfig.max}
                </span>
              </div>
            </div>
          );
        } else if (widgetConfig.type === 'checkbox') {
          // Use local value if available, otherwise fall back to config value
          const currentValue =
            localValues[widgetConfig.property] ??
            configData[widgetConfig.property];

          return (
            <div
              key={widgetConfig.property}
              className="visual-editor-checkbox"
            >
              <div className="checkbox-header">
                <label
                  htmlFor={widgetConfig.property}
                  className="checkbox-label"
                >
                  {widgetConfig.label}
                </label>
                <span className="checkbox-value">
                  {currentValue ? 'On' : 'Off'}
                </span>
              </div>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id={widgetConfig.property}
                  className="checkbox-input"
                  checked={currentValue}
                  onChange={onCheckboxChange(
                    widgetConfig.property,
                  )}
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
        } else if (widgetConfig.type === 'textInput') {
          // Use local value if available, otherwise fall back to config value
          const currentValue =
            localValues[widgetConfig.property] ??
            configData[widgetConfig.property];

          return (
            <div
              key={widgetConfig.property}
              className="visual-editor-text-input"
            >
              <div className="text-input-header">
                <label
                  htmlFor={widgetConfig.property}
                  className="text-input-label"
                >
                  {widgetConfig.label}
                </label>
              </div>
              <div className="text-input-container">
                <input
                  type="text"
                  id={widgetConfig.property}
                  className="text-input-field"
                  value={currentValue || ''}
                  onChange={onTextInputChange(
                    widgetConfig.property,
                  )}
                />
              </div>
            </div>
          );
        } else if (widgetConfig.type === 'dropdown') {
          // Use local value if available, otherwise fall back to config value
          const currentValue =
            localValues[widgetConfig.property] ??
            configData[widgetConfig.property];
          const isOpen =
            openDropdown === widgetConfig.property;

          return (
            <div
              key={widgetConfig.property}
              className="visual-editor-dropdown"
            >
              <div className="dropdown-header">
                <label
                  htmlFor={widgetConfig.property}
                  className="dropdown-label"
                >
                  {widgetConfig.label}
                </label>
                {/* <span className="dropdown-value">
                  {currentValue}
                </span> */}
              </div>
              <div className="dropdown-container">
                <button
                  type="button"
                  className={`dropdown-button ${
                    isOpen ? 'open' : ''
                  }`}
                  onClick={() =>
                    handleDropdownToggle(
                      widgetConfig.property,
                    )
                  }
                  aria-expanded={isOpen}
                  aria-haspopup="listbox"
                >
                  <span className="dropdown-button-text">
                    {currentValue}
                  </span>
                  <div
                    className={`dropdown-arrow ${
                      isOpen ? 'open' : ''
                    }`}
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
                    {widgetConfig.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`dropdown-option ${
                          option === currentValue
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() =>
                          handleDropdownOptionClick(
                            widgetConfig.property,
                            option,
                          )
                        }
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        } else if (widgetConfig.type === 'color') {
          // Use local value if available, otherwise fall back to config value
          const currentHex =
            localValues[widgetConfig.property] ??
            configData[widgetConfig.property] ??
            '#000000';

          // Convert hex to LCH for slider values
          let hclColor;
          try {
            const rgbColor = color(currentHex);
            hclColor = hcl(rgbColor)
          } catch (error) {
            hclColor = hcl("black");
          }

          // Use local LCH values if available, otherwise convert from hex
          const currentH =
            localValues[`${widgetConfig.property}_h`] ??
            hclColor.h;
          const currentC =
            localValues[`${widgetConfig.property}_c`] ??
            hclColor.c;
          const currentL =
            localValues[`${widgetConfig.property}_l`] ??
            hclColor.l;

          return (
            <div
              key={widgetConfig.property}
              className="visual-editor-color"
            >
              <div className="color-header">
                <label className="color-label">
                  {widgetConfig.label}
                </label>
                <span className="color-value">
                  {currentHex}
                </span>
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
                    <input
                      type="range"
                      className="slider-input"
                      min={0}
                      max={100}
                      step={1}
                      value={currentL}
                      onChange={onColorChange(
                        widgetConfig.property,
                        'l',
                      )}
                    />
                    <div
                      className="slider-track-fill"
                      style={{ width: `${currentL}%` }}
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
                    <label className="slider-label">
                      Chroma
                    </label>
                    <span className="slider-value">
                      {Math.round(currentC)}
                    </span>
                  </div>
                  <div className="slider-container">
                    <input
                      type="range"
                      className="slider-input"
                      min={0}
                      max={100}
                      step={1}
                      value={currentC}
                      onChange={onColorChange(
                        widgetConfig.property,
                        'c',
                      )}
                    />
                    <div
                      className="slider-track-fill"
                      style={{ width: `${currentC}%` }}
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
                    <label className="slider-label">
                      Hue
                    </label>
                    <span className="slider-value">
                      {Math.round(currentH)}°
                    </span>
                  </div>
                  <div className="slider-container">
                    <input
                      type="range"
                      className="slider-input"
                      min={0}
                      max={360}
                      step={1}
                      value={currentH}
                      onChange={onColorChange(
                        widgetConfig.property,
                        'h',
                      )}
                    />
                    <div
                      className="slider-track-fill"
                      style={{
                        width: `${(currentH / 360) * 100}%`,
                      }}
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
        }
      })}
    </div>
  );
};
