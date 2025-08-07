import { useCallback, useContext } from 'react';
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
              text: JSON.stringify(newConfigData),
            },
          },
        }));

        runPrettierRef.current();

        iframeRef.current.contentWindow.postMessage({
          [property]: newValueOfConsistentType,
        });
      },
    [configData, files, configFileId],
  );

  const visualEditorWidgets: VisualEditorConfigEntry[] =
    configData.visualEditorWidgets;

  return (
    <>
      {visualEditorWidgets.map((widgetConfig, index) => {
        if (widgetConfig.type === 'number') {
          return (
            <div key={widgetConfig.property}>
              <input
                type="range"
                id={widgetConfig.property}
                min={widgetConfig.min}
                max={widgetConfig.max}
                onInput={onInputUpdate(
                  widgetConfig.property,
                  configData[widgetConfig.property],
                )}
                defaultValue={
                  configData[widgetConfig.property]
                }
              ></input>
              <label htmlFor={widgetConfig.property}>
                {widgetConfig.label}
              </label>
            </div>
          );
        }
      })}
    </>
  );
};
