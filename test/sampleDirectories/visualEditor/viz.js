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
      // Verify the message contains config data
      if (event.data && typeof event.data === 'object') {
        // Update the config with the received data
        setState((state) => ({
          ...state,
          config: {
            ...state.config,
            ...event.data,
          },
        }));
      }
    });

    // Mark that we've attached the event listener to avoid duplicates
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
    // Transform string properties in config to accessor functions
    const configWithAccessors = {
      ...config,
      xValue: (d) => d[config.xValue],
      yValue: (d) => d[config.yValue],
    };

    scatterPlot(svg, {
      ...configWithAccessors,
      data,
      dimensions,
    });
  }
};
