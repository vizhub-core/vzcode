import { createStateField } from 'd3-rosetta';
import { setupSVG } from './setupSVG.js';
import { renderLoadingState } from './renderLoadingState.js';
import { asyncRequest } from './asyncRequest.js';
import { loadAndParseData } from './loadAndParseData.js';
import { scatterPlot } from './scatterPlot.js';
import { measureDimensions } from './measureDimensions.js';
import { json } from 'd3';

export const viz = (container, state, setState) => {
  const stateField = createStateField(state, setState);
  const [dataRequest, setDataRequest] =
    stateField('dataRequest');
  const [config, setConfig] = stateField('config');

  // Set up postMessage event listener if not already set
  if (!state.eventListenerAttached) {
    window.addEventListener('message', (event) => {
      if (event.data && typeof event.data === 'object') {
        setState((state) => ({
          ...state,
          config: {
            ...state.config,
            ...event.data,
          },
        }));
      }
    });

    setState((prevState) => ({
      ...prevState,
      eventListenerAttached: true,
    }));
  }

  // Load config first if not already loaded
  if (!config) {
    json('config.json')
      .then((loadedConfig) => {
        setConfig(loadedConfig);
      })
      .catch((error) => {
        console.error('Failed to load config:', error);
      });
    return;
  }

  // After config is loaded, load the data
  if (!dataRequest) {
    return asyncRequest(setDataRequest, () =>
      loadAndParseData(config.dataUrl),
    );
  }

  const { data, error } = dataRequest;
  const dimensions = measureDimensions(container);
  const svg = setupSVG(container, dimensions);

  renderLoadingState(svg, {
    shouldShow: !data,
    text: error
      ? `Error: ${error.message}`
      : config.loadingMessage,
    x: dimensions.width / 2,
    y: dimensions.height / 2,
    fontSize: config.loadingFontSize,
    fontFamily: config.loadingFontFamily,
  });

  if (data) {
    // Safely transform config properties to accessor functions
    const configWithAccessors = {
      ...config,
      xValue: config.xValue
        ? (d) => d[config.xValue]
        : () => 0,
      yValue: config.yValue
        ? (d) => d[config.yValue]
        : () => 0,
      sizeValue: config.sizeValue
        ? (d) => d[config.sizeValue]
        : null,
      pointRadiusValue: config.pointRadiusValue
        ? (d) => d[config.pointRadiusValue]
        : null,
    };

    scatterPlot(svg, {
      ...configWithAccessors,
      data,
      dimensions,
    });
  }
};
