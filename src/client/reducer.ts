export const reducer = (state, action) => {
  switch (action.type) {
    // TODO phase this out
    case 'set_tab_list': {
      return {...state, tabList: action.tabList}
    }
    // TODO eventually
    // case 'init_sharedb': {
    //   return {
    //     ...state,
    //     submitOperation: action.submitOperation
    //   }
    // }
    // case 'open_tab': {
    //   return {
    //     ...state,
    //     tabList: [...state.tabList, action.fileId]
    //   };
    // }
    // case 'close_tab': {
    // case 'delete_file': {
    // case 'delete_directory': {
    // case 'create_file': {
    //           state.submitOperation((document) => ({
    //             ...document,
    //             files: {
    //               ...document.files,
    //               [randomId()]: { name:action.name, text: '' },
    //             },
    //           }))
    //           return state;

    //     }
    // case 'rename_file': {
    // ...



  }
  throw Error('Unknown action: ' + action.type);
};