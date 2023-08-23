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
    if (!content) return;
    const files = content.files;

    if (!activeFileId) return;
    const activeFile = files[activeFileId];
    if (!activeFile) return;

    const { text } = activeFile;

    // Send the code to the worker, debounced.
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.log('Sending text to Prettier worker');
      console.log(text);
      worker.postMessage(text);
    }, autoPrettierDebounceTimeMS);
  }, [content, activeFileId]);

  // Listen for messages from the worker.
  useEffect(() => {
    // Add the event listener
    const listener = (event) => {
      const text = event.data;

      // TODO make sure this doesn't
      // trigger another Prettier run.
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
      // submitOperation((document) => {
      //   const files = document.files;
      //   const activeFile = files[activeFileId];
      //   const newActiveFile = {
      //     ...activeFile,
      //     text,
      //   };
      //   const newFiles = {
      //     ...files,
      //     [activeFileId]: newActiveFile,
      //   };
      //   return {
      //     ...document,
      //     files: newFiles,
      //   };
      // });
    };
    worker.addEventListener('message', listener);

    // Clean up
    return () => {
      worker.removeEventListener('message', listener);
    };
  }, [submitOperation, activeFileId]);

  //     // Function to debounce the saving
  // let debounceTimeout;
  // function debounceSave() {
  //   clearTimeout(debounceTimeout);
  //   debounceTimeout = setTimeout(save, autoSaveDebounceTimeMS);
  // }
  // // Subscribe to listen for modifications
  // shareDBDoc.subscribe(() => {
  //   shareDBDoc.on('op', (op) => {
  //     if (shareDBDoc.data.isInteracting) {
  //       throttleSave();
  //     } else {
  //       debounceSave();
  //     }
  //   });
  // });
};
