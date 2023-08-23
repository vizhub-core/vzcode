import { useEffect, useRef } from 'react';
import { FileId, VZCodeContent } from '../../types';
import PrettierWorker from './worker?worker';

const worker = new PrettierWorker();

// The time in milliseconds by which auto-saving is debounced.
const autoPrettierDebounceTimeMS = 1000;

export const usePrettier = ({
  content,
  submitOperation,
  activeFileId,
}: {
  content: VZCodeContent;
  submitOperation: (
    updateFunction: (document: VZCodeContent) => VZCodeContent,
  ) => void;
  activeFileId: FileId;
}) => {
  const timeoutRef = useRef(null);

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
  }, [content]);

  // Listen for messages from the worker.
  useEffect(() => {
    // Add the event listener
    const listener = (event) => {
      console.log('Got message from Prettier worker');
      console.log(event.data);
      //   const { text } = event.data;
      //   submitOperation((document) => {
      //     const files = document.files;
      //     const activeFile = files[activeFileId];
      //     const newActiveFile = {
      //       ...activeFile,
      //       text,
      //     };
      //     const newFiles = {
      //       ...files,
      //       [activeFileId]: newActiveFile,
      //     };
      //     return {
      //       ...document,
      //       files: newFiles,
      //     };
      //   });
    };
    worker.addEventListener('message', listener);

    // Clean up
    return () => {
      worker.removeEventListener('message', listener);
    };
  }, [submitOperation]);

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
