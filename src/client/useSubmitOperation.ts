import { useCallback } from 'react';
import { ShareDBDoc } from '../types'; // Assuming ShareDBDoc is already generic
import { createSubmitOperation } from '../submitOperation';

// A generic helper function to submit diff-based operations to ShareDB
export const useSubmitOperation = <T>(
  shareDBDoc: ShareDBDoc<T>,
): ((next: (data: T) => T) => void) => {
  const submitOperation: (next: (data: T) => T) => void =
    useCallback(() => {
      return createSubmitOperation(shareDBDoc);
    }, [shareDBDoc])();

  return submitOperation;
};
