import { useEffect, useRef } from 'react';
import { SubmitOperation, VZCodeContent } from '../types';

// Runs the code by flashing `isInteracting` to `true`.
export const useRunCode = (
  submitOperation: SubmitOperation,
) => {
  const runCodeRef = useRef(null);
  useEffect(() => {
    const runCode = () => {
      submitOperation((content: VZCodeContent) => ({
        ...content,
        isInteracting: true,
      }));
      setTimeout(() => {
        // This somewhat cryptic logic
        // deletes the `isInteracting` property
        // from the document.
        submitOperation(
          ({ isInteracting, ...newDocument }) =>
            newDocument,
        );
      }, 0);
    };
    runCodeRef.current = runCode;
  }, [submitOperation]);
  return runCodeRef;
};
