import { VZAction, VZState } from '.';
import { SearchFile, ShareDBDoc, VZCodeContent } from '../../types';

function searchPattern(shareDBDoc: ShareDBDoc<VZCodeContent>, pattern: string): Array<SearchFile> {
  const files = shareDBDoc.data.files
  const fileIds = Object.keys(shareDBDoc.data.files);
  let results: Array<SearchFile> = [];

  for (let i = 0; i < fileIds.length; i++) {
    const file = files[fileIds[i]];  

    if (files[fileIds[i]].text) {
      const fileName = file.name;
      const lines = file.text.split("\n");
      const patterns = [];

      for (let j = 0; j < lines.length; j++) {
        const index = lines[j].indexOf(pattern);;

        if (index !== -1) {
          patterns.push({ line: j + 1, index: index, text: lines[j] });
        }
      }

      if (patterns.length > 0) {
        results.push({ id: fileIds[i], name: fileName, lines: patterns });
      }
    }
  }

  return results;
}

export const setIsSearchOpenReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'set_is_search_open'
    ? { ...state, isSearchOpen: action.value }
    : state;

export const setSearchReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'set_search'
    ? { ...state, search: { pattern: action.value, results: [] } }
    : state;

export const setSearchResultsReducer = (
      state: VZState,
      action: VZAction,
    ): VZState =>
      action.type === 'set_search_results'
        ? { ...state, search: { pattern: state.search.pattern, results: searchPattern(action.files,state.search.pattern) } }
        : state;