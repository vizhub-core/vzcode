import { useEffect, useRef } from 'react';
import { FileId, ShareDBDoc, VZCodeContent } from '../../types';
// @ts-ignore
import PrettierWorker from './worker?worker';

const worker = new PrettierWorker();

// The time in milliseconds by which auto-saving is debounced.
const autoPrettierDebounceTimeMS = 1000;

export const usePrettier = ({
  content,
  //   shareDBDoc,
  submitOperation,
  activeFileId,
}: {
  //   shareDBDoc: ShareDBDoc<VZCodeContent>;
  content: VZCodeContent;
  submitOperation: (
    updateFunction: (document: VZCodeContent) => VZCodeContent,
  ) => void;
  activeFileId: FileId;
}) => {
  const timeoutRef = useRef(null);
  const ignoreNextChangeRef = useRef(false);
  const isFirstRender = useRef(true);
  const activeFileIdRef = useRef(activeFileId);

  // Keep active file ref in sync.
  // A ref is used for this because Prettier
  // should not be triggered when the active file changes.
  // It should only be triggered when the active file's
  // text changes.
  useEffect(() => {
    activeFileIdRef.current = activeFileId;
  }, [activeFileId]);

  //   // Subscribe to listen for modifications
  //   useEffect(() => {
  //     if (!shareDBDoc) return;
  //     shareDBDoc.subscribe(() => {
  //       shareDBDoc.on('op', () => {
  //         if (!shareDBDoc.data.isInteracting) {
  //         }
  //       });
  //     });
  //   }, [shareDBDoc]);

  useEffect(() => {
    // Don't run Prettier on the first render.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Don't run Prettier if the change originated from Prettier.
    if (ignoreNextChangeRef.current) {
      //   console.log('ignoring change so Prettier runs only once');
      ignoreNextChangeRef.current = false;
      return;
    }

    // Do nothing if content is not yet loaded.
    if (!content) return;
    const files = content.files;

    const activeFileId = activeFileIdRef.current;

    // Do nothing if there is no active file.
    if (!activeFileId) return;
    const activeFile = files[activeFileId];

    // Do nothing if active file id is bogus.
    if (!activeFile) return;

    const { text } = activeFile;

    // Send the code to the worker, debounced.
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      //   console.log('Sending text to Prettier worker');
      //   console.log(text);
      worker.postMessage(text);
    }, autoPrettierDebounceTimeMS);
  }, [content]);

  // Listen for messages from the worker.
  useEffect(() => {
    // Add the event listener
    const listener = (event) => {
      const text = event.data;

      // Make sure this doesn't trigger another Prettier run.
      ignoreNextChangeRef.current = true;

      submitOperation((document) => ({
        ...document,
        files: {
          ...document.files,
          [activeFileId]: {
            ...document.files[activeFileId],
            text,
          },
        },
      }));
    };
    worker.addEventListener('message', listener);

    return () => {
      worker.removeEventListener('message', listener);
    };
  }, [submitOperation, activeFileId]);
};
