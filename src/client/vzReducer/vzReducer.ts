import type { VZState as ImportedVZState, VZAction as ImportedVZAction } from ".";

type VZStateLocal = {
  closedTabs: string[]; // Add this line
};

// Add the new action type to the VZAction type definition
type VZActionLocal = 
  | { type: "set_active_file_id"; payload: any }
  | { type: "set_active_file_left"; payload: any }
  | { type: "set_active_file_right"; payload: any }
  | { type: "open_tab"; payload: any }
  | { type: "close_tabs"; payload: any }
  | { type: "set_theme"; payload: any }
  | { type: "set_is_settings_open"; payload: any }
  | { type: "set_is_doc_open"; payload: any }
  | { type: "set_is_search_open"; payload: any }
  | { type: "split_current_pane"; payload: any }
  | { type: "tabs.pushClosed"; filename: string }
  | { type: "tabs.popClosed" }; 

export function vzReducer(state: VZStateLocal, action: VZActionLocal): VZStateLocal {
  switch (action.type) {
    case "tabs.pushClosed": {
      const next = state.closedTabs.slice();
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
