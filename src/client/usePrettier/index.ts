import { JSONOp } from 'ot-json1';
import { FileId, ShareDBDoc, VZCodeContent } from '../../types';
import { useEffect, useRef } from 'react';
// @ts-ignore
import PrettierWorker from './worker?worker';

// The time in milliseconds by which auto-saving is debounced.
const autoPrettierDebounceTimeMS = 1000;

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
  submitOperation,
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

    const prettierWorker = new PrettierWorker();

    // Get the message that comes back from the worker.
    // This is the prettified text for a specific file.
    const handleMessage = (event) => {
      const { fileId, error, fileTextPrettified } = event.data;
      if (error) {
        console.log(error);
        return;
      }

      // console.log('Prettier worker returned text for file', fileId);

      // console.log(fileId, error, fileTextPrettified);
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
    prettierWorker.addEventListener('message', handleMessage);

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

        console.log('Sending text to Prettier worker');
        // console.log(data);

        // Run Prettier for this file
        prettierWorker.postMessage(data);
      }
    };

    // Function to debounce running Prettier
    let debounceTimeout;
    function debouncePrettier() {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(runPrettier, autoPrettierDebounceTimeMS);
    }

    // Listen for changes
    shareDBDoc.on('op batch', (op: JSONOp, isLocal: boolean) => {
      // Only act on changes coming from the client
      if (isLocal) {
        console.log('op', JSON.stringify(op, null, 2));

        // If the op is coming from Prettier itself,
        // then do nothing.
        if (isApplyingOpRef.current) {
          console.log('ignoring op from Prettier');
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

          console.log('Op is for file', fileId);
        }
      } else {
        // console.log('ignoring op from remote', op, isLocal);
      }

      // In the event that the component unmounts,
      return () => {
        // Remove the event listener
        prettierWorker.removeEventListener('message', handleMessage);

        // Clear the timeout
        clearTimeout(debounceTimeout);
      };
    });
  }, [shareDBDoc]);
};
// import { useEffect, useRef } from 'react';
// import { FileId, ShareDBDoc, VZCodeContent } from '../../types';

// const worker = new PrettierWorker();

// // Ideas for next steps:
// // - Isolate this as a thing
// //   that only depends on shareDBDoc.

// export const usePrettier = ({
//   content,
//   //   shareDBDoc,
//   submitOperation,
//   activeFileId,
// }: {
//   //   shareDBDoc: ShareDBDoc<VZCodeContent>;
//   content: VZCodeContent;
//   submitOperation: (
//     updateFunction: (document: VZCodeContent) => VZCodeContent,
//   ) => void;
//   activeFileId: FileId;
// }) => {
//   const timeoutRef = useRef(null);
//   const ignoreNextChangeRef = useRef(false);
//   const isFirstRender = useRef(true);
//   const activeFileIdRef = useRef(activeFileId);

//   // Keep active file ref in sync.
//   // A ref is used for this because Prettier
//   // should not be triggered when the active file changes.
//   // It should only be triggered when the active file's
//   // text changes.
//   useEffect(() => {
//     activeFileIdRef.current = activeFileId;
//   }, [activeFileId]);

//   //   // Subscribe to listen for modifications
//   //   useEffect(() => {
//   //     if (!shareDBDoc) return;
//   //     shareDBDoc.subscribe(() => {
//   //       shareDBDoc.on('op', () => {
//   //         if (!shareDBDoc.data.isInteracting) {
//   //         }
//   //       });
//   //     });
//   //   }, [shareDBDoc]);

//   useEffect(() => {
//     // Don't run Prettier on the first render.
//     if (isFirstRender.current) {
//       isFirstRender.current = false;
//       return;
//     }

//     // Don't run Prettier if the change originated from Prettier.
//     if (ignoreNextChangeRef.current) {
//       //   console.log('ignoring change so Prettier runs only once');
//       ignoreNextChangeRef.current = false;
//       return;
//     }

//     // Do nothing if content is not yet loaded.
//     if (!content) return;
//     const files = content.files;

//     const activeFileId = activeFileIdRef.current;

//     // Do nothing if there is no active file.
//     if (!activeFileId) return;
//     const activeFile = files[activeFileId];

//     // Do nothing if active file id is bogus.
//     if (!activeFile) return;

//     const { text } = activeFile;

//     // Send the code to the worker, debounced.
//     clearTimeout(timeoutRef.current);
//     timeoutRef.current = setTimeout(() => {
//       //   console.log('Sending text to Prettier worker');
//       //   console.log(text);
//       // TODO pass file name to worker
//       worker.postMessage(text);
//       //   worker.postMessage({
//       //     activeFileId,
//       //     activeFile,
//       //   });
//     }, autoPrettierDebounceTimeMS);
//   }, [content]);

//   // Listen for messages from the worker.
//   useEffect(() => {
//     // Add the event listener
//     const listener = (event) => {
//       const text = event.data;

//       // Make sure this doesn't trigger another Prettier run.
//       ignoreNextChangeRef.current = true;

//       // TODO make absolutely sure activeFileId is correct
//       // by passing it into the worker and back out.
//       submitOperation((document) => ({
//         ...document,
//         files: {
//           ...document.files,
//           [activeFileId]: {
//             ...document.files[activeFileId],
//             text,
//           },
//         },
//       }));
//     };
//     worker.addEventListener('message', listener);

//     return () => {
//       worker.removeEventListener('message', listener);
//     };
//   }, [submitOperation, activeFileId]);
// };
