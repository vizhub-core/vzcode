import { useCallback } from 'react';
import { ShareDBDoc, VZCodeContent } from '../types';
import { diff } from './diff';

// A helper function to submit diff-based operations to ShareDB
export const useSubmitOperation = (
  shareDBDoc: ShareDBDoc<VZCodeContent>,
): ((
  next: (content: VZCodeContent) => VZCodeContent,
) => void) => {
  const submitOperation: (
    next: (content: VZCodeContent) => VZCodeContent,
  ) => void = useCallback(
    (next) => {
      const content: VZCodeContent = shareDBDoc.data;
      const op = diff(content, next(content));
      if (op && shareDBDoc) {
        shareDBDoc.submitOp(op);
      }
    },
    [shareDBDoc],
  );

  return submitOperation;
};
