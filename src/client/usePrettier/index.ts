import { VizFileId, VizContent } from '@vizhub/viz-types';
import { JSONOp, ShareDBDoc } from '../../types';
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

export const usePrettier = ({
  shareDBDoc,
  submitOperation,
  prettierWorker,
}: {
  shareDBDoc: ShareDBDoc<VizContent> | null;
  submitOperation: (
    next: (content: VizContent) => VizContent,
  ) => void;
  prettierWorker: Worker;
}) => {
  // The set of files that have been modified
  // since the last Prettier run.
  const dirtyFilesRef = useRef<Set<VizFileId>>(new Set());

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

  // We use a ref to keep track of the runPrettier function.
  const runPrettierRef = useRef(null);

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
    runPrettierRef.current = runPrettier;

    const handleOpBatch = (op: JSONOp) => {
      // Only act on changes coming from the client
      // OR changes coming from the AI Assist that we
      // if (isLocal) {
      // If the op is coming from Prettier itself,
      // then do nothing.
      if (isApplyingOpRef.current) {
        // console.log('ignoring op from Prettier');
        return;
      }

      // Check if the path of this op is the text content of a file
      if (
        op &&
        op.length === 4 &&
        op[0] === 'files' &&
        typeof op[1] === 'string' &&
        op[2] === 'text'
      ) {
        // Get the file id
        const fileId: VizFileId = op[1];

        // Add the file id to the set of dirty files
        dirtyFilesRef.current.add(fileId);
      }
    };

    // Listen for changes
    shareDBDoc.on('op batch', handleOpBatch);

    // Clean up the event listeners
    return () => {
      prettierWorker.removeEventListener(
        'message',
        handleMessage,
      );

      shareDBDoc.removeListener('op batch', handleOpBatch);
    };
  }, [shareDBDoc, prettierWorker, submitOperation]);

  // Return the errors and run prettier function ref
  // for use elsewhere.
  return { prettierError, runPrettierRef };
};
