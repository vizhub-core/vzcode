// // import { TabState, VZAction, VZState } from '.';

// // export const openTabReducer = (
// //   state: VZState,
// //   action: VZAction,
// // ): VZState => {
// //   if (action.type !== 'open_tab') return state;

// //   // Is the tab already open?
// //   const tabIsOpen = state.tabList.some(
// //     (tab) => tab.fileId === action.fileId,
// //   );

// //   // The new tab state.
// //   const newTabState: TabState = {
// //     fileId: action.fileId,
// //     isTransient: action.isTransient,
// //   };
// // //
// //   return {
// //     ...state,
// //     activeFileId: action.fileId,
// //     tabList: !tabIsOpen
// //       ? [...state.tabList, newTabState]
// //       : state.tabList.map((tabState) =>
// //           tabState.fileId === action.fileId
// //             ? newTabState
// //             : tabState,
// //         ),
// //   };
// // };

// import { TabState, VZAction, VZState } from '.';

// export const openTabReducer = (
//   state: VZState,
//   action: VZAction,
// ): VZState => {
//   if (action.type !== 'open_tab') return state;

//   // Is the tab already open?
//   const tabIsOpen = state.tabList.some(
//     (tab) => tab.fileId === action.fileId,
//   );

//   // Find if there's any transient tab
//   const transientTabIndex = state.tabList.findIndex(
//     (tab) => tab.isTransient,
//   );

//   // The new tab state.
//   const newTabState: TabState = {
//     fileId: action.fileId,
//     isTransient: action.isTransient,
//   };

//   let newTabList: Array<TabState>;

//   if (tabIsOpen) {
//     newTabList = state.tabList.map((tabState) =>
//       tabState.fileId === action.fileId
//         ? newTabState
//         : tabState,
//     );
//   } else if (transientTabIndex !== -1) {
//     newTabList = [...state.tabList];
//     newTabList[transientTabIndex] = newTabState;
//   } else {
//     newTabList = [...state.tabList, newTabState];
//   }

//   return {
//     ...state,
//     activeFileId: action.fileId,
//     tabList: newTabList,
//   };
// };

import { TabState, VZAction, VZState } from '.';

export const openTabReducer = (
  state: VZState,
  action: VZAction,
): VZState => {
  if (action.type !== 'open_tab') return state;

  // Check if the tab is already open and if it's transient.
  const existingTabIndex = state.tabList.findIndex(
    (tab) => tab.fileId === action.fileId,
  );
  const tabExists = existingTabIndex !== -1;
  const existingTabIsTransient =
    tabExists &&
    state.tabList[existingTabIndex].isTransient;

  // Find if there's any other transient tab.
  const transientTabIndex = state.tabList.findIndex(
    (tab) =>
      tab.isTransient && tab.fileId !== action.fileId,
  );

  // The new tab state.
  const newTabState: TabState = {
    fileId: action.fileId,
    isTransient: action.isTransient,
  };

  let newTabList: Array<TabState>;

  if (tabExists) {
    if (existingTabIsTransient) {
      newTabList = state.tabList.map((tabState) =>
        tabState.fileId === action.fileId
          ? newTabState
          : tabState,
      );
    } else {
      newTabList = [...state.tabList];
    }
  } else if (transientTabIndex !== -1) {
    newTabList = [...state.tabList];
    newTabList[transientTabIndex] = newTabState;
  } else {
    newTabList = [...state.tabList, newTabState];
  }

  return {
    ...state,
    activeFileId: action.fileId,
    tabList: newTabList,
  };
};
