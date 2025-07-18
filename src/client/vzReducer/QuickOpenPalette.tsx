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
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => dispatch({ type: 'quickOpen.hide' })}
      />

      {/* palette */}
      <div className="relative w-[480px] overflow-hidden rounded-lg bg-zinc-900 shadow-xl">
        <input
          autoFocus
          spellCheck={false}
          value={quickOpen.query}
          onKeyDown={e => e.key === 'Escape' && dispatch({ type: 'quickOpen.hide' })}
          onChange={e => dispatch({ type: 'quickOpen.setQuery', value: e.target.value })}
          placeholder="Type a file name…"
          className="w-full border-b border-zinc-700 bg-transparent px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none"
        />

        <ul className="max-h-[360px] overflow-y-auto py-1 text-sm">
          {results.map(f => (
            <li
              key={f}
              onClick={() => open(f)}
              className="cursor-pointer px-4 py-1 hover:bg-zinc-800"
            >
              {f}
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-4 py-2 text-zinc-500">No matches</li>
          )}
        </ul>
      </div>
    </div>
  );
};

/* — utility — */
type FTNode =
  | { type: 'file'; path: string }
  | { type: 'dir'; children: FTNode[] };

const flatten = (tree: FTNode[]): string[] => {
  const out: string[] = [];
  const walk = (n: FTNode[]) =>
    n.forEach(v => (v.type === 'file' ? out.push(v.path) : walk(v.children)));
  walk(tree);
  return out;
};
