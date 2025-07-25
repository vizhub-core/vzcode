import { useEffect } from 'react';
import {
  createRuntime,
  VizHubRuntime,
} from '@vizhub/runtime';
import BuildWorker from './buildWorker?worker';

const enableIframe = true;

export const VZRight = () => {
  useEffect(() => {
    // Get the iframe from the DOM
    const iframe = document.getElementById(
      'viz-iframe',
    ) as HTMLIFrameElement;

    // Initialize the worker
    const worker = new BuildWorker();

    // Create runtime
    const runtime: VizHubRuntime = createRuntime({
      iframe,
      worker,
      setBuildErrorMessage: (error) => {
        if (error) {
          console.error('Build error:', error);
        }
      },
    });

    // Run code in the iframe
    runtime.run({
      files: {
        'index.js':
          'console.log("Hello from VizHub runtime!");',
        'index.html':
          '<div id="root">Runtime content will appear here</div>',
      },
      enableHotReloading: true,
      enableSourcemap: true,
      vizId: 'example-viz',
    });

    // Cleanup on unmount
    return () => {
      runtime.cleanup();
      worker.terminate();
    };
  }, []);

  return (
    <div className="right">
      {enableIframe ? (
        <iframe id="viz-iframe"></iframe>
      ) : null}
    </div>
  );
};
