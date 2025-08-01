import { useContext } from "react";
import { VZCodeContext } from "./VZCodeContext";
import type { Theme } from "./types";

export const ThemeToggleButton = () => {
  const { state, dispatch } = useContext(VZCodeContext);
  const next: Theme = state.theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label="Toggle theme"
      className="absolute right-4 top-4 rounded bg-zinc-800 px-3 py-1 text-xs hover:bg-zinc-700"
      onClick={() => dispatch({ type: "theme.toggle" })}
    >
      {next === "dark" ? "🌙" : "☀️"}
    </button>
  );
};
