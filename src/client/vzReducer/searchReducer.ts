import { VZAction, VZState } from '.';
import { SearchFile, ShareDBDoc, VZCodeContent } from '../../types';

function jumpToFile(files: ShareDBDoc<VZCodeContent>, fileId: number, line: number) {

}

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
        const index = lines[j].indexOf(pattern) || lines[j].indexOf(pattern.trim());

        if (index !== -1) {
          console.log(lines[j]);
          patterns.push({ line: j, index: index, text: lines[j] });
        }
      }

      if (patterns.length > 0) {
        results.push({ id: fileIds[i], name: fileName, lines: patterns });
      }
    }
  }

  return results;
}

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
    
export const jumpToSearchReducer = (action: VZAction): void =>  {
  if (action.type === 'jump_to_search') {
    // Turn fileId into active file and then jump to the line
    const file = action.files;
    const fileId = action.id;
    const fileName = action.line;
  }
}
