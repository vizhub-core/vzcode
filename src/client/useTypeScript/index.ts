import { JSONOp } from 'ot-json1';
import {
  FileId,
  ShareDBDoc,
  VZCodeContent,
} from '../../types';
import { useEffect, useRef, useState,useCallback } from 'react';

// The time in milliseconds by which auto-saving is debounced.
const autoSaveDebounceTimeMS = 1200;


export const useTypeScript= ({
    content,
    typeScriptWorker
}:{
    content: VZCodeContent,
    typeScriptWorker: Worker
}) => {
   
    // When Content changes, update the TypeScript worker
    // with the new content, but debounced.

    // This keeps track of the setTimeout ID across renders.
    const debounceTimeoutId = useRef<number | null>(null);




//   // Function to debounce running Prettier
//   let debounceTimeout;
//   function debounceUpdateContent() {
//     clearTimeout(debounceTimeout);
//     debounceTimeout = setTimeout(
//       updateContent,
//       autoSaveDebounceTimeMS,
//     );
//   }

   const debounceUpdateContent = useCallback((content) => {
    clearTimeout(debounceTimeoutId.current);
    // TODO fix TypeScript error
    debounceTimeoutId.current = setTimeout(
      () => {
        console.log("Should post message now")
        console.log("new content: ",JSON.stringify(content))
        // // Updates the TypeScript worker with the current content
        // // of the files.
        // typeScriptWorker.postMessage({
        //   event: 'update-content',
        //   details: content,
        // });
      },
      autoSaveDebounceTimeMS,
    );
   },[])

   useEffect(() => {
    debounceUpdateContent(content);
    return () => {
        //   // Remove the event listener
        //   prettierWorker.removeEventListener(
        //     'message',
        //     handleMessage,
        //   );
    
          // Clear the timeout
        //   clearTimeout(debounceTimeout);
          clearTimeout(debounceTimeoutId.current);
        };
}    ,[content])


  
    

// // Updates the TypeScript worker with the current content
// // of the files.
// typeScriptWorker.postMessage({
//     event: 'update-content',
//     details: content,
//   });

  
};
