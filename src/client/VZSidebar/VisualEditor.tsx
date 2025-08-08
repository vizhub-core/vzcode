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
      <>
        To begin using the visual editor, create a
        config.json.
      </>
    );
  }

  let configData;

  try {
    configData = JSON.parse(files[configFileId].text);
  } catch (error) {
    return <>Your config.json file is not valid json.</>;
  }

  if (!('visualEditorWidgets' in configData)) {
    return (
      <>
        To begin using the visual editor, make sure your
        config.json has a key called "visualEditorWidgets",
        whose value is the config for the visual editor.
      </>
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
