import {
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import { VZCodeContext } from '../VZCodeContext';
import { VizContent, VizFileId } from '@vizhub/viz-types';
import { VisualEditorConfigEntry } from '../../types';
import { EmptyState } from './EmptyState';

const CONFIG_FILE_NAME = 'config.json';

export const VisualEditor = () => {
  const {
    files,
    submitOperation,
    runPrettierRef,
    iframeRef,
  } = useContext(VZCodeContext);

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
    configData = JSON.parse(files[configFileId].text);
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

  const onInputUpdate = useCallback(
    (
      property: string,
      previousValue: any,
    ): React.FormEventHandler<HTMLInputElement> =>
      (event) => {
        //TODO: test race condition in which someone is editing the config file as another user uses the visual editor

        const newValueOfConsistentType =
          typeof previousValue === 'number'
            ? parseFloat(event.currentTarget.value)
            : event.currentTarget.value;

        const newConfigData = {
          ...configData,
          [property]: newValueOfConsistentType,
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

        iframeRef.current.contentWindow.postMessage({
          [property]: newValueOfConsistentType,
        });
      },
    [configData, files, configFileId],
  );

  const visualEditorWidgets: VisualEditorConfigEntry[] =
    configData.visualEditorWidgets;

  // Track previous config state to detect changes from any source (remote clients, text editor, etc.)
  const previousConfigRef = useRef<any>(null);

  // Detect config.json changes and send updates to iframe
  useEffect(() => {
    if (
      !configFileId ||
      !files ||
      !files[configFileId] ||
      !iframeRef.current?.contentWindow
    ) {
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

  // State for advanced interactions
  const [activeSlider, setActiveSlider] = useState<
    string | null
  >(null);
  const [isDragging, setIsDragging] = useState<
    string | null
  >(null);
  const [hoverValue, setHoverValue] = useState<
    number | null
  >(null);
  const sliderRefs = useRef<{
    [key: string]: HTMLInputElement | null;
  }>({});

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

  // Helper function to calculate percentage for progress fill
  const calculatePercentage = (
    value: number,
    min: number,
    max: number,
  ) => {
    return ((value - min) / (max - min)) * 100;
  };

  // Enhanced input handler with animations
  const onInputUpdateEnhanced = useCallback(
    (
      property: string,
      previousValue: any,
      widgetConfig: VisualEditorConfigEntry,
    ): React.FormEventHandler<HTMLInputElement> =>
      (event) => {
        const newValueOfConsistentType =
          typeof previousValue === 'number'
            ? parseFloat(event.currentTarget.value)
            : event.currentTarget.value;

        const newConfigData = {
          ...configData,
          [property]: newValueOfConsistentType,
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

        iframeRef.current.contentWindow.postMessage({
          [property]: newValueOfConsistentType,
        });

        // Trigger value change animation
        const sliderElement = sliderRefs.current[property];
        if (sliderElement) {
          sliderElement.classList.add('value-changed');
          setTimeout(() => {
            sliderElement.classList.remove('value-changed');
          }, 300);
        }
      },
    [configData, files, configFileId],
  );

  // Mouse event handlers for enhanced interactions
  const handleMouseDown = (property: string) => {
    setIsDragging(property);
    setActiveSlider(property);
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleMouseEnter = (property: string) => {
    setActiveSlider(property);
  };

  const handleMouseLeave = () => {
    setActiveSlider(null);
    setHoverValue(null);
  };

  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(null);
    };

    document.addEventListener(
      'mouseup',
      handleGlobalMouseUp,
    );
    return () => {
      document.removeEventListener(
        'mouseup',
        handleGlobalMouseUp,
      );
    };
  }, []);

  return (
    <div className="visual-editor">
      {visualEditorWidgets.map((widgetConfig, index) => {
        if (widgetConfig.type === 'number') {
          const currentValue =
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
                  step="any"
                  onInput={onInputUpdate(
                    widgetConfig.property,
                    configData[widgetConfig.property],
                  )}
                  defaultValue={currentValue}
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
        }
      })}
    </div>
  );
};
