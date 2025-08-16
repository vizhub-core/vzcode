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
        }
      })}
    </div>
  );
};
