// --- vzReducer.ts ---
import type { VZState, VZAction } from "./types";

export function vzReducer(state: VZState, action: VZAction): VZState {
  switch (action.type) {
    case "tabs.pushClosed": {
      const next = state.closedTabs.slice();
      // de‑dupe latest (avoid A,A,A if user closes/reopens repeatedly)
      const trimmed = next.filter((f) => f !== action.filename);
      trimmed.unshift(action.filename);
      if (trimmed.length > 20) trimmed.length = 20;
      return { ...state, closedTabs: trimmed };
    }

    case "tabs.popClosed": {
      if (state.closedTabs.length === 0) return state;
      const [, ...rest] = state.closedTabs;
      return { ...state, closedTabs: rest };
    }

    // keep your other cases as‑is
    default:
      return state;
  }
}
