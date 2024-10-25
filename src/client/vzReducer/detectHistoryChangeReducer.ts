import { VZAction, VZState } from '.';

export const detectHistoryChangeReducer = (state, action) => {
    switch (action.type) {
      case 'detect_history_change':
        console.log("Testing page change");
        return state; // No state change, just logging for now
  
      default:
        return state;
    }
  };
  
// export const setThemeReducer = (
//   state: VZState,
//   action: VZAction,
// ): VZState =>
//   action.type === 'set_theme'
//     ? { ...state, theme: action.themeLabel }
//     : state;
