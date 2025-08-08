import { useContext, useEffect, useMemo, useRef, useState } from "react";
import fuzzysort from "fuzzysort";
import { VZCodeContext } from "./VZCodeContext";
import type { VZState, VZAction } from ".";

/**
 * QuickOpenPalette – VS Code–style file opener
 * Adds keyboard navigation: ↑/↓ to move, Enter to open, Esc to close.
 * Includes ARIA roles for better accessibility.
 */
export const QuickOpenPalette = () => {
  const { state, dispatch } = useContext(VZCodeContext) as {
    state: VZState;
    dispatch: React.Dispatch<VZAction>;
  };

  const { quickOpen, fileTree } = state;
  if (!quickOpen.isVisible) return null;

  // flatten tree once
  const allFiles = useMemo(() => flatten(fileTree), [fileTree]);

  // debounced query for smoother typing on huge trees
  const debouncedQuery = useDebouncedValue(quickOpen.query, 80);

  const results = useMemo(() => {
    const q = debouncedQuery.trim();
    return q === ""
      ? quickOpen.recent
      : fuzzysort.go(q, allFiles).map((r) => r.target as string);
  }, [debouncedQuery, allFiles, quickOpen.recent]);

  // active item index for keyboard nav
  const [active, setActive] = useState(results.length ? 0 : -1);
  useEffect(() => {
    setActive(results.length ? 0 : -1);
  }, [results]);

  const inputRef = useRef<HTMLInputElement>(null);

  const open = (filename: string) => {
    dispatch({ type: "openTab", filename });
    dispatch({ type: "quickOpen.addRecent", filename });
    dispatch({ type: "quickOpen.hide" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      dispatch({ type: "quickOpen.hide" });
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!results.length) return;
      setActive((i) => (i + 1) % results.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!results.length) return;
      setActive((i) => (i - 1 + results.length) % results.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && results[active]) open(results[active]);
      return;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Quick Open"
      onClick={() => dispatch({ type: "quickOpen.hide" })}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* palette (clicks inside should not close) */}
      <div
        className="relative w-[520px] overflow-hidden rounded-lg bg-zinc-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          autoFocus
          spellCheck={false}
          value={quickOpen.query}
          onKeyDown={onKeyDown}
          onChange={(e) =>
            dispatch({ type: "quickOpen.setQuery", value: e.target.value })
          }
          placeholder="Type a file name…"
          className="w-full border-b border-zinc-700 bg-transparent px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          aria-controls="quickopen-list"
          aria-activedescendant={
            active >= 0 ? `qo-opt-${active}` : undefined
          }
        />

        <ul
          id="quickopen-list"
          role="listbox"
          className="max-h-[360px] overflow-y-auto py-1 text-sm"
        >
          {results.map((f, i) => {
            const isActive = i === active;
            return (
              <li
                id={`qo-opt-${i}`}
                role="option"
                aria-selected={isActive}
                key={f}
                onMouseEnter={() => setActive(i)}
                onClick={() => open(f)}
                className={`cursor-pointer px-4 py-1 ${
                  isActive ? "bg-zinc-800 text-zinc-100" : "hover:bg-zinc-800"
                }`}
              >
                {f}
              </li>
            );
          })}

          {results.length === 0 && (
            <li className="px-4 py-2 text-zinc-500">No matches</li>
          )}
        </ul>
      </div>
    </div>
  );
};

/* — utilities — */

type FTNode =
  | { type: "file"; path: string }
  | { type: "dir"; children: FTNode[] };

const flatten = (tree: FTNode[]): string[] => {
  const out: string[] = [];
  const walk = (n: FTNode[]) =>
    n.forEach((v) => (v.type === "file" ? out.push(v.path) : walk(v.children)));
  walk(tree);
  return out;
};

function useDebouncedValue<T>(value: T, delay = 80): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
