import { useCallback, useEffect, useRef } from 'react';
import { VizContent } from '@vizhub/viz-types';
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
  content: VizContent;
  typeScriptWorker: Worker;
}) => {
  // When Content changes, update the TypeScript worker
  // with the new content, but debounced.

  // This keeps track of the setTimeout ID across renders.
  const debounceTimeoutId = useRef<number | null>(null);

  const debounceUpdateContent = useCallback(
    (content: VizContent) => {
      // Handle the case where the content has not yet been loaded.
      if (content === null) {
        return;
      }
      clearTimeout(debounceTimeoutId.current);
      debounceTimeoutId.current = window.setTimeout(() => {
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
};
