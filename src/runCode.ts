import { SubmitOperation } from './types';
import { VizContent } from '@vizhub/viz-types';

// Extend VizContent type to include hardRerun property
type ExtendedVizContent = VizContent & {
  hardRerun?: boolean;
};

/**
 * Creates a runCode function that triggers code execution by flashing `isInteracting` to `true`.
 * This works for both client-side (with submitOperation) and server-side (with ShareDB document).
 */
export const createRunCodeFunction = (
  submitOperation: SubmitOperation,
) => {
  return (hardRerun = false) => {
    // Use the unified submitOperation approach for both client and server
    submitOperation(
      (content: VizContent) =>
        ({
          ...content,
          isInteracting: true,
          ...(hardRerun && { hardRerun: true }),
        }) as ExtendedVizContent,
    );

    setTimeout(() => {
      // This somewhat cryptic logic
      // deletes the `isInteracting` and `hardRerun` properties
      // from the document.
      submitOperation(
        ({
          isInteracting,
          hardRerun,
          ...newDocument
        }: ExtendedVizContent) => newDocument,
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
