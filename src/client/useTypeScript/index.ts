//     import { JSONOp } from 'ot-json1';
// import {
//   FileId,
//   ShareDBDoc,
//   VZCodeContent,
// } from '../../types';
// import { useEffect, useRef, useState,useCallback } from 'react';

import { useCallback, useEffect, useRef } from 'react';
import { VZCodeContent } from '../../types';
import { autoPrettierDebounceTimeMS } from '../usePrettier';

// We don't want to send the message _before_ Prettier runs,
// so we need to wait at least as long as Prettier takes to run,
// plus some "wiggle room" which is amount of time it may take
// to aactually run Prettier and update the document.
const wiggleRoom = 500;

// The time in milliseconds by which auto-saving is debounced.
const sendMessageDebounceTimeMS =
  autoPrettierDebounceTimeMS + wiggleRoom;

export const useTypeScript = ({
  content,
  typeScriptWorker,
}: {
  content: VZCodeContent;
  typeScriptWorker: Worker;
}) => {
  // When Content changes, update the TypeScript worker
  // with the new content, but debounced.

  // This keeps track of the setTimeout ID across renders.
  const debounceTimeoutId = useRef<number | null>(null);

  const debounceUpdateContent = useCallback(
    (content: VZCodeContent) => {
      clearTimeout(debounceTimeoutId.current);
      debounceTimeoutId.current = window.setTimeout(() => {
        // Updates the TypeScript worker with the current content
        // of the files.
        typeScriptWorker.postMessage({
          event: 'update-content',
          details: content,
        });
      }, sendMessageDebounceTimeMS);
    },
    [typeScriptWorker],
  );

  useEffect(() => {
    debounceUpdateContent(content);
  }, [content]);

  //   function debounceUpdateContent() {
  //     clearTimeout(debounceTimeout);
  //     debounceTimeout = setTimeout(
  //       updateContent,
  //       autoSaveDebounceTimeMS,
  //     );
  //   }
};

//    useEffect(() => {
//     debounceUpdateContent(content);
//     return () => {
//         //   // Remove the event listener
//         //   prettierWorker.removeEventListener(
//         //     'message',
//         //     handleMessage,
//         //   );

//           // Clear the timeout
//         //   clearTimeout(debounceTimeout);
//           clearTimeout(debounceTimeoutId.current);
//         };
// }    ,[content])

// // // Updates the TypeScript worker with the current content
// // // of the files.
// // typeScriptWorker.postMessage({
// //     event: 'update-content',
// //     details: content,
// //   });

// };
