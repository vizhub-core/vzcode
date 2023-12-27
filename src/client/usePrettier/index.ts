import { JSONOp } from '../../ot';
import {
  FileId,
  ShareDBDoc,
  VZCodeContent,
} from '../../types';
import { useEffect, useRef, useState } from 'react';

// The time in milliseconds by which auto-saving is debounced.
export const autoPrettierDebounceTimeMS = 1200;

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

// export const shouldTriggerRun = (event: KeyboardEvent) => {
//   if(event.ctrlKey && event.key === 's') {
//     return true;
//   }
// }

export const shouldTriggerRun = (event: KeyboardEvent) => {
  const isMac = /Mac|iMac|MacBook/i.test(
    navigator.userAgent,
  );
  const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

  if (ctrlOrCmd && event.key === 's') {
    // Save
    return true;
  } else if (
    event.key === 'F5' || // Run (F5)
    (ctrlOrCmd && event.key === 'Enter') || // Ctrl+Enter or Cmd+Enter
    (event.shiftKey && event.key === 'Enter') || // Shift+Enter
    // Let's not override the browser's default behavior for refresh page.
    // (ctrlOrCmd && event.key === 'r') || // Ctrl+R or Cmd+R

    (event.altKey && event.key === 'Enter') || // Alt+Enter
    (ctrlOrCmd &&
      event.shiftKey &&
      (event.key === 'B' || event.key === 'b')) || // Ctrl+Shift+B or Cmd+Shift+B
    (ctrlOrCmd && event.shiftKey && event.key === 'F10') || // Ctrl+Shift+F10 or Cmd+Shift+F10
    event.key === 'F8' ||
    event.key === 'F9'
  ) {
    return true;
  }
  return false;
};

export const usePrettier = ({
  shareDBDoc,
  submitOperation,
  prettierWorker,
  enableManualPretter,
}: {
  shareDBDoc: ShareDBDoc<VZCodeContent> | null;
  submitOperation: (
    next: (content: VZCodeContent) => VZCodeContent,
  ) => void;
  prettierWorker: Worker;
  enableManualPretter: boolean;
}) => {
  // The set of files that have been modified
  // since the last Prettier run.
  // const dirtyFiles: Set<FileId> = new Set<FileId>();
  const dirtyFilesRef = useRef<Set<FileId>>(new Set());

  // State to hold the error from Prettier
  // `null` means no errors
  // If this is a string, it's the
  // error message from Prettier.
  const [prettierError, setPrettierError] = useState<
    string | null
  >(null);

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

      // Handle syntax errors
      if (error) {
        // If there's an error, set the error state
        setPrettierError(error);

        // Return early as there is no text change to apply.
        return;
      } else {
        // Make sure the error overlay goes away
        // when Prettier runs successfully with no errors.
        setPrettierError(null);
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

      // Get the set of dirty files
      const dirtyFiles = dirtyFilesRef.current;

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

    let debouncePrettier;
    let debounceTimeout;
    let handleKeyDown;
    if (enableManualPretter) {
      handleKeyDown = (event: KeyboardEvent) => {
        if (shouldTriggerRun(event)) {
          event.preventDefault();
          runPrettier();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
    } else {
      // Function to debounce running Prettier

      debouncePrettier = () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(
          runPrettier,
          autoPrettierDebounceTimeMS,
        );
      };
      //Stops prettier from running when you perform a mouse move or a keydown
      window.addEventListener(
        'mousemove',
        debouncePrettier,
      );
      window.addEventListener('keydown', debouncePrettier);
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
            dirtyFilesRef.current.add(fileId);

            // Debounce running Prettier
            if (!enableManualPretter) {
              debouncePrettier();
            }
            // console.log('Op is for file', fileId);
          }
        } else {
          // console.log('ignoring op from remote', op, isLocal);
        }
      },
    );

    // In the event that the component unmounts,
    return () => {
      // Remove the event listener
      prettierWorker.removeEventListener(
        'message',
        handleMessage,
      );
      if (enableManualPretter) {
        document.removeEventListener(
          'keydown',
          handleKeyDown,
        );
      } else {
        window.removeEventListener(
          'keydown',
          debouncePrettier,
        );
        window.removeEventListener(
          'mousemove',
          debouncePrettier,
        );

        // Clear the timeout
        clearTimeout(debounceTimeout);
      }
    };
  }, [shareDBDoc]);
  return { prettierError }; // Return the errors for use in other files
};
