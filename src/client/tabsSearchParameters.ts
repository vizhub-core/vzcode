import { FileId, VZCodeContent } from '../types';
import { TabState } from './vzReducer';

// The delimiter used to separate file names in the `tabs` parameter.
export const delimiter = ';';

// Gets the file id of a file with the given name.
// Returns null if not found.
const getFileId = (
  content: VZCodeContent,
  fileName: string,
): string | null => {
  if (content && content.files) {
    for (const fileId of Object.keys(content.files)) {
      const file = content.files[fileId];
      if (file.name === fileName) {
        return fileId;
      }
    }
  }
  return null;
};

// Gets the file name of a file with the given id,
// guard against failure cases.
// Returns null if not found.
const getFileName = (
  content: VZCodeContent,
  fileId: string,
): string | null => {
  if (content && content.files) {
    const file = content.files[fileId];
    if (file) {
      return file.name;
    }
  }
  return null;
};

// Decodes the tab list and active file from the search parameters.
export const decodeTabs = ({
  searchParams,
  content,
}: {
  searchParams: URLSearchParams;
  content: VZCodeContent;
}): {
  tabList: Array<TabState>;
  activeFileId: FileId;
} => {
  const tabList: TabState[] = [];

  // Decode active file
  const activeFileName = searchParams.get('file');
  const activeFileId = getFileId(content, activeFileName);

  // Decode tab list
  const tabs = searchParams.get('tabs');
  if (tabs) {
    tabs.split(delimiter).forEach((fileName) => {
      const fileId = getFileId(content, fileName);
      if (fileId) {
        tabList.push({ fileId });
      }
    });
  } else if (activeFileId) {
    // If there's only an active file without a tab list
    tabList.push({ fileId: activeFileId });
  }

  return { tabList, activeFileId };
};

// Encodes the tab list and active file into the search parameters.
export const encodeTabs = ({
  tabList,
  activeFileId,
  content,
  searchParams = new URLSearchParams(),
}: {
  tabList: Array<TabState>;
  activeFileId: FileId | null;
  content: VZCodeContent;

  // The existing search params, if any.
  // This is provided so that we can preserve
  // any other search parameters that might be present.
  searchParams?: URLSearchParams;
}): URLSearchParams => {
  // Get the file name of the active file
  const activeFileName = getFileName(content, activeFileId);

  // If that's missing, no need to proceed (should never happen).
  if (activeFileName) {
    // In any case we set the `file` parameter.
    searchParams.set('file', activeFileName);

    // We only need to encode the `tabs` parameter
    // if there's more than one tab.
    if (tabList.length > 1) {
      // Set tab list
      const tabs = tabList
        .map((tabstate: TabState) =>
          getFileName(content, tabstate.fileId),
        )
        .join(delimiter);
      searchParams.set('tabs', tabs);
    }
  }

  return searchParams;
};
