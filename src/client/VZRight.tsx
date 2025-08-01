import {
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  createRuntime,
  VizHubRuntime,
} from '@vizhub/runtime';
import BuildWorker from './buildWorker?worker';
import { VZCodeContext } from './VZCodeContext';
import { vizFilesToFileCollection } from '@vizhub/viz-utils';

const enableIframe = true;

export const VZRight = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const runtimeRef = useRef<VizHubRuntime | null>(null);
  const isFirstRunRef = useRef(true);

  // Get access to the current files.
  const { content, handleRuntimeError, clearRuntimeError } =
    useContext(VZCodeContext);

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
    if (!runtimeRef.current && iframeRef.current) {
      const worker = new BuildWorker();
      runtimeRef.current = createRuntime({
        iframe: iframeRef.current,
        worker,
        setBuildErrorMessage: (error) => {
          if (error) {
            console.error('Build error:', error);
          }
        },
        handleRuntimeError,
      });
    }

    // Run code in the iframe
    if (isFirstRunRef.current || isInteracting) {
      // Clear runtime errors when new code runs
      clearRuntimeError();

      runtimeRef.current?.run({
        files,
        enableHotReloading: !isFirstRunRef.current,
        enableSourcemap: true,
        vizId: 'example-viz',
      });
      isFirstRunRef.current = false;
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
        <iframe ref={iframeRef}></iframe>
      ) : null}
    </div>
  );
};
