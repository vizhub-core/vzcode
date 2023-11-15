import { useCallback } from 'react';
import { ShareDBDoc } from '../types'; // Assuming ShareDBDoc is already generic
import { diff } from './diff';

// A generic helper function to submit diff-based operations to ShareDB
export const useSubmitOperation = <T>(
  shareDBDoc: ShareDBDoc<T>,
): ((next: (data: T) => T) => void) => {
  const submitOperation: (next: (data: T) => T) => void =
    useCallback(
      (next) => {
        const data: T = shareDBDoc.data;
        const op = diff(data, next(data));
        if (op && shareDBDoc) {
          shareDBDoc.submitOp(op);
        }
      },
      [shareDBDoc],
    );

  return submitOperation;
};
