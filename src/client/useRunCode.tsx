import { useEffect, useRef } from 'react';
import { SubmitOperation } from '../types';
import { createRunCodeFunction } from '../runCode';

// Runs the code by flashing `isInteracting` to `true`.
export const useRunCode = (
  submitOperation: SubmitOperation,
) => {
  const runCodeRef = useRef(null);
  useEffect(() => {
    const runCode = createRunCodeFunction(submitOperation);
    runCodeRef.current = runCode;
  }, [submitOperation]);
  return runCodeRef;
};
