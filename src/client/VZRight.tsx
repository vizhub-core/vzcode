import { useContext, useEffect, useMemo } from 'react';
import {
  createRuntime,
  VizHubRuntime,
} from '@vizhub/runtime';
import BuildWorker from './buildWorker?worker';
import { VZCodeContext } from './VZCodeContext';
import { vizFilesToFileCollection } from '@vizhub/viz-utils';

const enableIframe = true;

// Singleton runtime instance
// TODO use refs, and cleanup on unmount
let runtime: VizHubRuntime = null;
let isFirstRun = true;

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

  const isInteracting = content?.isInteracting || false;

  useEffect(() => {
    if (!files) return;

    // Initialize the runtime only once
    if (!runtime) {
      const worker = new BuildWorker();
      const iframe = document.getElementById(
        'viz-iframe',
      ) as HTMLIFrameElement;
      runtime = createRuntime({
        iframe,
        worker,
        setBuildErrorMessage: (error) => {
          if (error) {
            console.error('Build error:', error);
          }
        },
      });
    }

    // Run code in the iframe
    if (isFirstRun || isInteracting) {
      runtime.run({
        files,
        enableHotReloading: true,
        enableSourcemap: true,
        vizId: 'example-viz',
      });
      isFirstRun = false;
    }

    // TODO use refs, and cleanup on unmount
    // return () => {
    //   runtime.cleanup();
    //   worker.terminate();
    // };
  }, [files, isInteracting]);

  return (
    <div className="right">
      {enableIframe ? (
        <iframe id="viz-iframe"></iframe>
      ) : null}
    </div>
  );
};
