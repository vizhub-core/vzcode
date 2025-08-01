import type { VZState, VZAction } from "./types";

export function vzReducer(state: VZState, action: VZAction): VZState {
  switch (action.type) {
    /* ————————— Zen Mode ————————— */
    case "zen.toggle":
      return { ...state, zenMode: !state.zenMode };

    /* ————————— Quick Open ————————— */
    case "quickOpen.show":
      return { ...state, quickOpen: { ...state.quickOpen, isVisible: true, query: "" } };
    case "quickOpen.hide":
      return { ...state, quickOpen: { ...state.quickOpen, isVisible: false, query: "" } };
    case "quickOpen.setQuery":
      return { ...state, quickOpen: { ...state.quickOpen, query: action.value } };
    case "quickOpen.addRecent": {
      const recent = state.quickOpen.recent.filter(f => f !== action.filename);
      recent.unshift(action.filename);
      if (recent.length > 20) recent.pop();
      return { ...state, quickOpen: { ...state.quickOpen, recent } };
    }

    /* ————————— Closed-tab stack ————————— */
    case "tabs.pushClosed": {
      const closed = state.closedTabs.filter(f => f !== action.filename);
      closed.unshift(action.filename);
      if (closed.length > 20) closed.pop();
      return { ...state, closedTabs: closed };
    }
    case "tabs.popClosed":
      return { ...state, closedTabs: state.closedTabs.slice(1) };

    /* ————————— Theme ————————— */
    case "theme.toggle":
      return { ...state, theme: state.theme === "dark" ? "light" : "dark" };
    case "theme.set":
      return { ...state, theme: action.value };

    /* ————————— default ————————— */
    default:
      return state;
  }
}
