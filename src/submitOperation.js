import { diff } from './client/diff.js';

/**
 * Creates a submitOperation function that can be used to submit diff-based operations to ShareDB.
 * This is the core logic extracted from useSubmitOperation for reuse across client and server.
 */
export const createSubmitOperation = (shareDBDoc) => {
  return (next) => {
    const data = shareDBDoc.data;
    const op = diff(data, next(data));
    if (op && shareDBDoc) {
      shareDBDoc.submitOp(op);
    }
  };
};
