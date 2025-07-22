import { createSubmitOperation } from './submitOperation.js';

/**
 * Creates a runCode function that triggers code execution by flashing `isInteracting` to `true`.
 * This works for both client-side (with submitOperation) and server-side (with ShareDB document).
 */
export const createRunCodeFunction = (
  submitOperationOrDoc,
) => {
  return () => {
    let submitOperation;

    // Check if this is a client-side submitOperation or server-side ShareDB document
    if (typeof submitOperationOrDoc === 'function') {
      // Client-side: already a submitOperation function
      submitOperation = submitOperationOrDoc;
    } else {
      // Server-side: create submitOperation from ShareDB document
      submitOperation = createSubmitOperation(
        submitOperationOrDoc,
      );
    }

    // Use the unified submitOperation approach for both client and server
    submitOperation((content) => ({
      ...content,
      isInteracting: true,
    }));

    setTimeout(() => {
      submitOperation((content) => ({
        ...content,
        isInteracting: false,
      }));
    }, 0);
  };
};

/**
 * Creates a runCodeRef object compatible with React refs.
 * This is useful for maintaining compatibility with existing code that expects a ref.
 */
export const createRunCodeRef = (submitOperationOrDoc) => {
  return {
    current: createRunCodeFunction(submitOperationOrDoc),
  };
};
