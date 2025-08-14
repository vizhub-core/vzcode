import {
  useCallback,
  useContext,
  useState,
  useRef,
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
  const { files, submitOperation, iframeRef } =
    useContext(VZCodeContext);

  // Local state to track widget values during user interaction
  const [localValues, setLocalValues] = useState<{
    [key: string]: number | boolean | string;
  }>({});

  let configFileId: VizFileId | null = null;
  for (const fileId in files) {
    if (files[fileId].name === CONFIG_FILE_NAME) {
      configFileId = fileId;
      break;
    }
  }

  if (configFileId === null) {
    return (
      <EmptyState>
        To begin using the visual editor, create a
        config.json.
      </EmptyState>
    );
  }

  let configData;

  try {
    configData = useMemo(
      () => JSON.parse(files[configFileId].text),
      [files[configFileId].text],
    );
  } catch (error) {
    return (
      <EmptyState>
        Your config.json file is not valid json.
      </EmptyState>
    );
  }

  if (!('visualEditorWidgets' in configData)) {
    return (
      <EmptyState>
        To begin using the visual editor, make sure your
        config.json has a key called "visualEditorWidgets",
        whose value is the config for the visual editor.
      </EmptyState>
    );
  }

  if (!Array.isArray(configData.visualEditorWidgets)) {
    return (
      <EmptyState>
        Your config.json file has "visualEditorWidgets" but
        it is not an array. Please make sure
        "visualEditorWidgets" is an array of widget
        configurations.
      </EmptyState>
    );
  }

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

  const visualEditorWidgets: VisualEditorConfigEntry[] =
    configData.visualEditorWidgets;

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
      }
    });
    setLocalValues(newLocalValues);
  }, [configData, visualEditorWidgets]);

  // Track previous config state to detect changes from any source (remote clients, text editor, etc.)
  const previousConfigRef = useRef<any>(null);

  // Detect config.json changes and send updates to iframe
  useEffect(() => {
    if (!configFileId || !files || !files[configFileId]) {
      return;
    }

    let newConfigData;
    try {
      newConfigData = JSON.parse(files[configFileId].text);
    } catch (error) {
      // If config is invalid JSON, we can't process changes
      return;
    }

    const previousConfig = previousConfigRef.current;

    // Update the ref with the new config
    previousConfigRef.current = newConfigData;

    // Skip processing if this is the first time or if there's no previous config
    if (!previousConfig) {
      return;
    }

    // Find changed top-level properties
    const changedProperties: { [key: string]: any } = {};

    // Check all properties in the new config
    for (const key in newConfigData) {
      if (newConfigData[key] !== previousConfig[key]) {
        // Deep comparison for objects to detect actual changes
        if (
          typeof newConfigData[key] === 'object' &&
          typeof previousConfig[key] === 'object'
        ) {
          if (
            JSON.stringify(newConfigData[key]) !==
            JSON.stringify(previousConfig[key])
          ) {
            changedProperties[key] = newConfigData[key];
          }
        } else {
          changedProperties[key] = newConfigData[key];
        }
      }
    }

    // Check for deleted properties (properties that existed before but don't exist now)
    for (const key in previousConfig) {
      if (!(key in newConfigData)) {
        changedProperties[key] = undefined;
      }
    }

    // Send changed properties to iframe if any changes were detected
    if (Object.keys(changedProperties).length > 0) {
      try {
        iframeRef.current.contentWindow.postMessage(
          changedProperties,
        );
      } catch (error) {
        console.error(
          'Failed to send config changes to iframe:',
          error,
        );
      }
    }
  }, [files, configFileId, iframeRef]);

  return (
    <div className="visual-editor">
      {visualEditorWidgets.map((widgetConfig, index) => {
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
        }
      })}
    </div>
  );
};
