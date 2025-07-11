import type { VZState, VZAction } from "./types";

/**
 * Keeps track of which files have unsaved edits ("dirty" flags).
 *
 * State additions (extend VZState):
 *   • `dirtyFileIds: Set<string>` – IDs of files with unsaved changes.
 *
 * Actions added to VZAction union:
 *   • { type: "markFileDirty";  fileId: string }
 *   • { type: "markFileSaved";  fileId: string }
 */
export const markFileDirtyReducer = (
  state: VZState,
  action: VZAction
): VZState => {
  switch (action.type) {
    case "markFileDirty": {
      if (state.dirtyFileIds.has(action.fileId)) return state; // already dirty
      return {
        ...state,
        dirtyFileIds: new Set([...state.dirtyFileIds, action.fileId]),
      };
    }

    case "markFileSaved": {
      if (!state.dirtyFileIds.has(action.fileId)) return state; // already clean
      const next = new Set(state.dirtyFileIds);
      next.delete(action.fileId);
      return { ...state, dirtyFileIds: next };
    }

    default:
      return state;
  }
};
