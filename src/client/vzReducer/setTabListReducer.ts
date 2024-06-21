// setTabListReducer.ts
import { VZState, VZAction } from './index';

export const setTabListReducer = (state: VZState, action: VZAction): VZState => {
  if (action.type !== 'set_tab_list') {
    return state;
  }

  return {
    ...state,
    tabList: action.tabList,
  };
};
