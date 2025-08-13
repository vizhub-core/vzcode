import { useContext, useEffect, useMemo, useRef, useState } from "react";
import fuzzysort from "fuzzysort";
import { VZCodeContext } from "./VZCodeContext";
import type { VZState, VZAction } from "./types";

/**
 * CommandPalette – ⌘/Ctrl + Shift + P
 * Fuzzy-search commands, ↑/↓ to move, Enter to run, Esc to close.
 */
export const CommandPalette = () => {
  const { state, dispatch } = useContext(VZCodeContext) as {
    state: VZState;
    dispatch: React.Dispatch<VZAction>;
  };

  const { commandPalette } = state;
  if (!commandPalette.isVisible) return null;

  const commands = useMemo(() => buildCommands(dispatch), [dispatch]);

  const results = useMemo(() => {
    const q = commandPalette.query.trim();
    if (!q) return commands.map((c) => ({ key: c.id, cmd: c, score: 0 }));
    return fuzzysort
      .go(q, commands, { key: "title" })
      .map((r) => ({ key: r.obj.id, cmd: r.obj, score: r.score }));
  }, [commandPalette.query, commands]);

  const [active, setActive] = useState(results.length ? 0 : -1);
  useEffect(() => setActive(results.length ? 0 : -1), [results]);

  const inputRef = useRef<HTMLInputElement>(null);

  const run = (cmd: Command) => {
    cmd.run();
    dispatch({ type: "command.hide" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      dispatch({ type: "command.hide" });
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
      if (active >= 0 && results[active]) run(results[active].cmd);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      onClick={() => dispatch({ type: "command.hide" })}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* panel */}
      <div
        className="relative w-[520px] overflow-hidden rounded-lg bg-zinc-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          autoFocus
          spellCheck={false}
          value={commandPalette.query}
          onKeyDown={onKeyDown}
          onChange={(e) =>
            dispatch({ type: "command.setQuery", value: e.target.value })
          }
          placeholder="Type a command… (e.g., “Toggle Theme”)"
          className="w-full border-b border-zinc-700 bg-transparent px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          aria-controls="cmd-list"
          aria-activedescendant={active >= 0 ? `cmd-opt-${active}` : undefined}
        />

        <ul id="cmd-list" role="listbox" className="max-h-[360px] overflow-y-auto py-1 text-sm">
          {results.map((r, i) => {
            const isActive = i === active;
            return (
              <li
                id={`cmd-opt-${i}`}
                role="option"
                aria-selected={isActive}
                key={r.key}
                onMouseEnter={() => setActive(i)}
                onClick={() => run(r.cmd)}
                className={`cursor-pointer px-4 py-2 ${
                  isActive ? "bg-zinc-800 text-zinc-100" : "hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{r.cmd.title}</span>
                  {r.cmd.hint && (
                    <span className="ml-3 text-[11px] text-zinc-400">{r.cmd.hint}</span>
                  )}
                </div>
              </li>
            );
          })}
          {results.length === 0 && (
            <li className="px-4 py-2 text-zinc-500">No matching commands</li>
          )}
        </ul>
      </div>
    </div>
  );
};

/* — command registry — */

type Command = {
  id: string;
  title: string;
  hint?: string;      // optional shortcut hint
  run: () => void;
};

function buildCommands(dispatch: React.Dispatch<VZAction>): Command[] {
  return [
    {
      id: "toggleTheme",
      title: "Toggle Theme",
      hint: "Ctrl/⌘ + Shift + L",
      run: () => dispatch({ type: "theme.toggle" }),
    },
    {
      id: "toggleZen",
      title: "Toggle Zen Mode",
      hint: "Ctrl/⌘ + Alt + Z",
      run: () => dispatch({ type: "zen.toggle" }),
    },
    {
      id: "quickOpen",
      title: "Quick Open: Open File…",
      hint: "Ctrl/⌘ + P",
      run: () => dispatch({ type: "quickOpen.show" }),
    },
    {
      id: "toggleSidebar",
      title: "Toggle Sidebar",
      run: () => dispatch({ type: "toggleSidebarOpen" as any }), // uses your existing action
    },
  ];
}
