import { JSONOp } from 'ot-json1';
import {
  FileId,
  ShareDBDoc,
  VZCodeContent,
} from '../../types';
import { useEffect, useRef } from 'react';

// The time in milliseconds by which auto-saving is debounced.
const autoPrettierDebounceTimeMS = 1200;

// Computes a file extension from a file name.
// Example: 'foo.js' => '.js'
const extension = (fileName: string) => {
  const match = fileName.match(/\.([^.]+)$/);
  if (match) {
    return match[1];
  } else {
    return '';
  }
};

export const usePrettier = (
  shareDBDoc: ShareDBDoc<VZCodeContent> | null,
  submitOperation: (
    next: (content: VZCodeContent) => VZCodeContent,
  ) => void,
  prettierWorker: Worker,
  onError: (error: string) => void // New parameter to handle errors
) => {
  // The set of files that have been modified
  // since the last Prettier run.
  const dirtyFiles: Set<FileId> = new Set<FileId>();

  // A ref to keep track of whether an op is being applied.
  // This is used to prevent Prettier from running
  // when the op is coming from Prettier itself.
  const isApplyingOpRef = useRef(false);

  useEffect(() => {
    if (!shareDBDoc) {
      return;
    }

    // Get the message that comes back from the worker.
    // This is the prettified text for a specific file.
    const handleMessage = (event) => {
      const { fileId, error, fileTextPrettified } =
        event.data;
      if (error) {
        console.log(error);
        // Handle error by invoking the provided error callback
        onError(error);
        return;
      }

      isApplyingOpRef.current = true;
      submitOperation((document) => ({
        ...document,
        files: {
          ...document.files,
          [fileId]: {
            ...document.files[fileId],
            text: fileTextPrettified,
          },
        },
      }));
      isApplyingOpRef.current = false;
    };

    // Listen for messages from the worker.
    prettierWorker.addEventListener(
      'message',
      handleMessage,
    );

    const runPrettier = async () => {
      // Get the content of the document
      const content = shareDBDoc.data;

      // Get the files
      const files = content.files;

      // Get the dirty files
      const dirtyFileIds = Array.from(dirtyFiles);

      // Clear the set of dirty files
      dirtyFiles.clear();

      // Run Prettier on each dirty file
      for (const fileId of dirtyFileIds) {
        // Get the file
        const file = files[fileId];

        // Craft the data to send to the worker
        const data = {
          fileText: file.text,
          fileExtension: extension(file.name),
          fileId,
        };

        // Run Prettier for this file
        prettierWorker.postMessage(data);
      }
    };

    // Function to debounce running Prettier
    let debounceTimeout;
    function debouncePrettier() {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(
        runPrettier,
        autoPrettierDebounceTimeMS,
      );
    }

    // Listen for changes
    shareDBDoc.on(
      'op batch',
      (op: JSONOp, isLocal: boolean) => {
        // Only act on changes coming from the client
        if (isLocal) {
          // If the op is coming from Prettier itself,
          // then do nothing.
          if (isApplyingOpRef.current) {
            // console.log('ignoring op from Prettier');
            return;
          }

          // Example op that we want to act on:
          // op [
          //   "files",
          //   "2514857669",
          //   "text",
          //   {
          //     "es": [
          //       18,
          //       "d"
          //     ]
          //   }
          // ]

          // Check if the path of this op is the text content of a file
          if (
            op &&
            op.length === 4 &&
            op[0] === 'files' &&
            typeof op[1] === 'string' &&
            op[2] === 'text'
          ) {
            // Get the file id
            const fileId: FileId = op[1];

            // Add the file id to the set of dirty files
            dirtyFiles.add(fileId);

            // Debounce running Prettier
            debouncePrettier();

            // console.log('Op is for file', fileId);
          }
        } else {
          // console.log('ignoring op from remote', op, isLocal);
        }

        // In the event that the component unmounts,
        return () => {
          // Remove the event listener
          prettierWorker.removeEventListener(
            'message',
            handleMessage,
          );

          // Clear the timeout
          clearTimeout(debounceTimeout);
        };
      },
    );
  }, [shareDBDoc]);
};
