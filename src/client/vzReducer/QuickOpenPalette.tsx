import fuzzysort from 'fuzzysort';
import { useContext, useMemo } from 'react'; // Add useMemo to the import
import { VZCodeContext } from '../VZCodeContext'; // Update to the correct path
import type { VZState as ImportedVZState, VZAction as ImportedVZAction } from '.';

// Add the action type for quickOpen
type VZActionType =
  | { type: 'open_tab'; fileId: string }
  | { type: 'quickOpen.hide' } // Add this line
  | { type: 'quickOpen.setQuery'; value: string }
  | { type: 'quickOpen.addRecent'; filename: string }
  // ... other action types

// Ensure that fileTree is included in the VZState type definition
type VZState = {
  quickOpen: {
    isVisible: boolean;
    query: string;
    recent: string[];
  };
  fileTree: FTNode[]; // Add this line to include fileTree
};


export const QuickOpenPalette = () => {
  const { state, dispatch } = useContext(VZCodeContext) as unknown as {
      state: VZState;
      dispatch: React.Dispatch<VZActionType>;
  };

  const { quickOpen, fileTree } = state as unknown as VZState;
  if (!quickOpen.isVisible) return null;

  // flatten file tree once per render
  const allFiles = useMemo(() => flatten(fileTree), [fileTree]);

  // decide what to show
  const results = useMemo(() => {
    const q = quickOpen.query.trim();
    return q === ''
      ? quickOpen.recent
      : fuzzysort.go(q, allFiles).map(r => r.target as string);
  }, [quickOpen, allFiles]);

  const open = (filename: string) => {
    dispatch({ type: 'open_tab', fileId: filename });
    dispatch({ type: 'quickOpen.addRecent', filename });
    dispatch({ type: 'quickOpen.hide' });
  };

};