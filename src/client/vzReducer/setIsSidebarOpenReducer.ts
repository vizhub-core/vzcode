import { State, Action } from "../types";

/**
 * Explicitly sets the sidebar open/closed.
 */
export function setIsSidebarOpenReducer(
  state: State,
  action: Action<boolean>
): State {
  return {
    ...state,
    isSidebarOpen: action.payload,
  };
}