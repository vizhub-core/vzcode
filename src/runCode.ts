import { SubmitOperation } from './types';
import { VizContent } from '@vizhub/viz-types';
import { createSubmitOperation } from './submitOperation';

/**
 * Creates a runCode function that triggers code execution by flashing `isInteracting` to `true`.
 * This works for both client-side (with submitOperation) and server-side (with ShareDB document).
 */
export const createRunCodeFunction = (
  submitOperationOrDoc:
    | SubmitOperation
    | { data: any; submitOp: (ops: any) => void },
) => {
  return () => {
    let submitOperation: SubmitOperation;

    // Check if this is a client-side submitOperation or server-side ShareDB document
    if (typeof submitOperationOrDoc === 'function') {
      // Client-side: already a submitOperation function
      submitOperation =
        submitOperationOrDoc as SubmitOperation;
    } else {
      // Server-side: create submitOperation from ShareDB document
      submitOperation = createSubmitOperation(
        submitOperationOrDoc,
      );
    }

    // Use the unified submitOperation approach for both client and server
    submitOperation((content: VizContent) => ({
      ...content,
      isInteracting: true,
    }));

    setTimeout(() => {
      // This somewhat cryptic logic
      // deletes the `isInteracting` property
      // from the document.
      submitOperation(
        ({ isInteracting, ...newDocument }) => newDocument,
      );
    }, 0);
  };
};

/**
 * Creates a runCodeRef object compatible with React refs.
 * This is useful for maintaining compatibility with existing code that expects a ref.
 */
export const createRunCodeRef = (
  submitOperationOrDoc:
    | SubmitOperation
    | { data: any; submitOp: (ops: any) => void },
) => {
  return {
    current: createRunCodeFunction(submitOperationOrDoc),
  };
};
