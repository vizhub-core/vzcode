
import { State } from "../types";


export function toggleSidebarOpenReducer(
  state: State
): State {
  return {
    ...state,
    isSidebarOpen: !state.isSidebarOpen,
  };
}