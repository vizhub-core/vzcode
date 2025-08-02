import { generateRunId } from '@vizhub/viz-utils';
import { SubmitOperation } from './types';
import { VizContent } from '@vizhub/viz-types';

/**
 * Creates a runCode function that triggers code execution by changing the `runId` in the content.
 * This works for both client-side (with submitOperation) and server-side (with ShareDB document).
 */
export const createRunCodeFunction =
  (submitOperation: SubmitOperation) => () => {
    submitOperation((content: VizContent) => ({
      ...content,
      runId: generateRunId(),
    }));
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
