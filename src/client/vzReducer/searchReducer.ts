import { VZAction, VZState } from '.';
import {
  SearchFile,
  SearchFileVisibility,
  SearchResult,
  ShareDBDoc,
  VZCodeContent,
} from '../../types';

function searchPattern(
  shareDBDoc: ShareDBDoc<VZCodeContent>,
  pattern: string,
): SearchResult {
  const files = shareDBDoc.data.files;
  const fileIds = Object.keys(shareDBDoc.data.files);
  let results: { [id: string]: SearchFile } = {};

  for (let i = 0; i < fileIds.length; i++) {
    const file = files[fileIds[i]];

    if (files[fileIds[i]].text) {
      const fileName = file.name;
      const lines = file.text.split('\n');
      const matches = [];

      for (let j = 0; j < lines.length; j++) {
        const index = lines[j].indexOf(pattern);

        if (index !== -1) {
          matches.push({
            line: j + 1,
            index: index,
            text: lines[j],
            isClosed: false,
          });
        }
      }

      if (matches.length > 0) {
        results[fileIds[i]] = {
          name: fileName,
          matches: matches,
          visibility: 'open',
        };
      }
    }
  }

  return results;
}

function updateSearchFileVisibility(
  results: SearchResult,
  id: string,
  visibility: SearchFileVisibility,
): SearchResult {
  return {
    ...results,
    [id]: { ...results[id], visibility: visibility },
  };
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
    ? {
        ...state,
        search: {
          ...state.search,
          pattern: action.value,
          results: {},
          focusedIndex: 0,
          focusedChildIndex: null,
          focused: true,
        },
      }
    : state;

export const setSearchResultsReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'set_search_results'
    ? {
        ...state,
        search: {
          ...state.search,
          pattern: state.search.pattern,
          results: searchPattern(
            action.files,
            state.search.pattern,
          ),
          focused: state.search.focused,
        },
      }
    : state;

export const setSearchFileVisibilityReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'set_search_file_visibility'
    ? {
        ...state,
        search: {
          ...state.search,
          pattern: state.search.pattern,
          results: updateSearchFileVisibility(
            state.search.results,
            action.id,
            action.visibility,
          ),
        },
      }
    : state;

export const setSearchLineVisibilityReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'hide_search_results_line'
    ? {
        ...state,
        search: {
          ...state.search,
          results: {
            ...state.search.results,
            [action.id]: {
              ...state.search.results[action.id],
              matches: state.search.results[
                action.id
              ].matches.filter(
                (match, index) =>
                  match.line !== action.line,
              ),
            },
          },
        },
      }
    : state;

export const setSearchFocusedIndexReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'set_active_search_index'
    ? {
        ...state,
        search: {
          ...state.search,
          focusedIndex: action.focusedIndex,
          focusedChildIndex: action.childIndex,
        },
      }
    : state;

export const toggleSearchFocusedReducer = (
  state: VZState,
  action: VZAction,
): VZState =>
  action.type === 'toggle_search_focused'
    ? {
        ...state,
        search: {
          ...state.search,
          focused: !state.search.focused,
        },
      }
    : state;
