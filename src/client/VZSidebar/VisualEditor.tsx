import { useContext } from 'react';
import { VZCodeContext } from '../VZCodeContext';
import { VizFileId } from '@vizhub/viz-types';
import { VisualEditorConfigEntry } from '../../types';

const CONFIG_FILE_NAME = 'config.json';

export const VisualEditor = () => {
  const { files } = useContext(VZCodeContext);

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

  const configData = JSON.parse(files[configFileId].text);

  if (!('visualEditorWidgets' in configData)) {
    return (
      <>
        To begin using the visual editor, make sure your
        config.json has a key called "visualEditorWidgets",
        whose value is the config for the visual editor.
      </>
    );
  }

  const visualEditorWidgets: VisualEditorConfigEntry[] =
    configData.visualEditorWidgets;

  return (
    <>
      {visualEditorWidgets.map((widgetConfig) => {
        if (widgetConfig.type === 'number') {
            return <div><input type='range' id={widgetConfig.property} min={widgetConfig.min} max={widgetConfig.max}></input><label htmlFor={widgetConfig.property}>{widgetConfig.label}</label></div>
        }
      })}
    </>
  );
};
