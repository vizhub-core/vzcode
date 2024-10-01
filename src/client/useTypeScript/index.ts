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

export const useEnhancedTypeScript = ({
    content,
    typeScriptWorker,
  }: {
    content: VZCodeContent;
    typeScriptWorker: Worker;
  }) => {
    const { error } = useTypeScript({ content, typeScriptWorker });
    const [validationResult, setValidationResult] = useState<string | null>(null);
  
    const validateContent = useCallback(() => {
      if (content === null) return;
  
      try {
        typeScriptWorker.postMessage({
          event: 'validate-content',
          details: content,
        });
      } catch (err) {
        setValidationResult('Failed to validate content.');
      }
    }, [content, typeScriptWorker]);
  
    useEffect(() => {
      if (!error) {
        validateContent();
      }
    }, [content, error]);
  
    // Listen for validation results from the TypeScript worker
    useEffect(() => {
      const handleMessage = (e: MessageEvent) => {
        if (e.data.event === 'validation-result') {
          setValidationResult(e.data.details);
        }
      };
  
      typeScriptWorker.addEventListener('message', handleMessage);
      return () => {
        typeScriptWorker.removeEventListener('message', handleMessage);
      };
    }, [typeScriptWorker]);
  
    return { error, validationResult };
  };