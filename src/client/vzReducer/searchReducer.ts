import { VZAction, VZState } from '.';
import { SearchFile, ShareDBDoc, VZCodeContent } from '../../types';

function searchPattern(shareDBDoc: ShareDBDoc<VZCodeContent>, pattern: string): { [id: string] : SearchFile } {
  const files = shareDBDoc.data.files
  const fileIds = Object.keys(shareDBDoc.data.files);
  let results: { [id: string] : SearchFile } = {};

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
        results[fileIds[i]]  = { name: fileName, lines: patterns, visibility: "open" };
      }
    }
  }

  return results;
}

function updateSearchResultVisibility(results: { [id: string] : SearchFile }, id: string,
    visibility: "open" | "flattened" | "closed"): { [id: string] : SearchFile } {

    return { ...results, [id]:  { ...results[id], visibility: visibility }};
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
    ? { ...state, search: { pattern: action.value, results: {} } }
    : state;

export const setSearchResultsReducer = (
      state: VZState,
      action: VZAction,
    ): VZState =>
      action.type === 'set_search_results'
        ? { ...state, search: { pattern: state.search.pattern, results: searchPattern(action.files,state.search.pattern) } }
        : state;

export const setSearchResultsVisibilityReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'set_search_results_visibility'
    ? { ...state, search: { pattern: state.search.pattern, results: updateSearchResultVisibility(state.search.results, action.id, action.visibility)} }
    : state;