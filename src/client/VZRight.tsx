import { useContext, useEffect, useMemo } from 'react';
import {
  createRuntime,
  VizHubRuntime,
} from '@vizhub/runtime';
import BuildWorker from './buildWorker?worker';
import { VZCodeContext } from './VZCodeContext';
import { vizFilesToFileCollection } from '@vizhub/viz-utils';

const enableIframe = true;

export const VZRight = () => {
  // Get access to the current files.
  const { content } = useContext(VZCodeContext);

  const files = useMemo(
    () =>
      content
        ? vizFilesToFileCollection(content.files)
        : null,
    [content?.files],
  );

  useEffect(() => {
    if (!files) return;
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
      files,
      enableHotReloading: true,
      enableSourcemap: true,
      vizId: 'example-viz',
    });

    // Cleanup on unmount
    return () => {
      runtime.cleanup();
      worker.terminate();
    };
  }, [files]);

  return (
    <div className="right">
      {enableIframe ? (
        <iframe id="viz-iframe"></iframe>
      ) : null}
    </div>
  );
};
