import { diff } from './ot.js';

/**
 * Creates a submitOperation function that can be used to submit diff-based operations to ShareDB.
 * This is the core logic extracted from useSubmitOperation for reuse across client and server.
 */
export const createSubmitOperation = <T>(shareDBDoc: {
  data: T;
  submitOp: (op: any) => void;
}): ((next: (data: T) => T) => void) => {
  return (next) => {
    const data: T = shareDBDoc.data;
    const op = diff(data, next(data));
    if (op && shareDBDoc) {
      shareDBDoc.submitOp(op);
    }
  };
};

/**
 * Type definition for the submitOperation function
 */
export type SubmitOperationFunction<T> = (
  next: (data: T) => T,
) => void;
