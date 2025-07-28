import { SubmitOperation } from './types';
import { VizContent } from '@vizhub/viz-types';

/**
 * Creates a runCode function that triggers code execution by flashing `isInteracting` to `true`.
 * This works for both client-side (with submitOperation) and server-side (with ShareDB document).
 */
export const createRunCodeFunction = (
  submitOperation: SubmitOperation,
) => {
  return () => {
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
    }, 100);
  };
};

/**
 * Creates a runCodeRef object compatible with React refs.
 * This is useful for maintaining compatibility with existing code that expects a ref.
 */
export const createRunCodeRef = (
  submitOperation: SubmitOperation,
) => {
  return {
    current: createRunCodeFunction(submitOperation),
  };
};
