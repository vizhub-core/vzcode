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
import { VizContent } from '@vizhub/viz-types';

// Extend VizContent type to include hardRerun property
type ExtendedVizContent = VizContent & {
  // TODO remove this, use the runId property from VizContent instead.
  // If `VizContent.runId` changes, it will trigger a hard rerun.
  hardRerun?: boolean;
};

const enableIframe = true;

export const VZRight = () => {
  const runtimeRef = useRef<VizHubRuntime | null>(null);
  const isFirstRunRef = useRef(true);
  const lastRunIdRef = useRef<string | undefined>(
    undefined,
  );

  // Get access to the current files.
  const {
    content,
    handleRuntimeError,
    clearRuntimeError,
    iframeRef,
  } = useContext(VZCodeContext);

  const files = useMemo(
    () =>
      content
        ? vizFilesToFileCollection(content.files)
        : null,
    [content],
  );

  const isInteracting = content?.isInteracting || false;
  const runId = content?.runId;
  const hardRerun =
    (content as ExtendedVizContent)?.hardRerun || false;

  // Check if runId has changed
  const runIdChanged = runId !== lastRunIdRef.current;
  if (runIdChanged) {
    lastRunIdRef.current = runId;
  }

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

    // Run code in the iframe when:
    // 1. First run
    // 2. User is interacting with widgets
    // 3. runId changed (indicating AI finished or other trigger)
    if (
      isFirstRunRef.current ||
      isInteracting ||
      runIdChanged
    ) {
      // Clear runtime errors when new code runs
      clearRuntimeError();

      runtimeRef.current?.run({
        files,
        // Enable hot reloading when interacting, disable when runId changed without interaction
        enableHotReloading: isInteracting,
        enableSourcemap: true,
        vizId: 'example-viz',

        // Don't clear the console here in VZCode, since
        // we often want to see debug logs across multiple runs.
        clearConsole: false,
      });
      isFirstRunRef.current = false;
    }

    // TODO use refs, and cleanup on unmount
    // return () => {
    //   runtime.cleanup();
    //   worker.terminate();
    // };
  }, [
    files,
    isInteracting,
    runIdChanged,
    hardRerun,
    clearRuntimeError,
    handleRuntimeError,
    iframeRef,
  ]);

  return (
    <div className="right">
      {enableIframe ? (
        <iframe ref={iframeRef}></iframe>
      ) : null}
    </div>
  );
};
