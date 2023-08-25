import { JSONOp } from 'ot-json1';
import { ShareDBDoc, VZCodeContent } from '../../types';
import { useEffect } from 'react';

export const usePrettier = (shareDBDoc: ShareDBDoc<VZCodeContent> | null) => {
  useEffect(() => {
    if (!shareDBDoc) {
      return;
    }
    // Listen for changes
    shareDBDoc.on('op', (op: JSONOp, isLocal: boolean) => {
      // Only act on changes coming from the client
      if (isLocal) {
        console.log('op', op, isLocal);
      } else {
        console.log('ignoring op', op, isLocal);
      }
    });
  }, [shareDBDoc]);
};
