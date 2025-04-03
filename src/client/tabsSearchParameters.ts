import { VizFileId, TabState, VizContent } from '../types';

// The delimiter used to separate file names in the `tabs` parameter.
// We need a character that is both URL-safe (does not get escaped in URLs)
// and is not typically found in file names, especially for JavaScript and CSS files.
//
// The following characters are not URL-safe as they get converted to escaped sequences in URLs,
// leading to less readable URLs:
// - `+` becomes `%2B`
// - `|` becomes `%7C`
// - `;` becomes `%3B`
// - `:` becomes `%3A`
// - `,` becomes `%2C`
// - `!` becomes `%21`
// - `/` becomes `%2F`
//
// The following characters, while URL-safe, are commonly used in file names,
// hence using them could lead to conflicts or misinterpretation:
// - `.` commonly used as a dot separator in file names and extensions
// - ` ` (space) often found in file names but can lead to issues in URLs
// - `-` (hyphen) frequently used in file and folder names for readability
// - `_` (underscore) also commonly used in file and folder names
//
// Considering the above constraints, we need a character that is both URL-safe
// and not typically used in file names. The following character meets these criteria:
// - `~` is URL-safe (remains unescaped in URLs) and is not a standard character
//   in file names for JavaScript and CSS files, making it a suitable choice for a delimiter.
export const delimiter = '~';

// Gets the file id of a file with the given name.
// Returns null if not found.
const getFileId = (
  content: VizContent,
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

// An object representing the search parameters.
export type TabStateParams = {
  file?: string;
  tabs?: string;
};

// Decodes the tab list and active file from the search parameters.
export const decodeTabs = ({
  tabStateParams,
  content,
}: {
  tabStateParams: TabStateParams;
  content: VZCodeContent;
}): {
  tabList: Array<TabState>;
  activeFileId: VizFileId;
} => {
  const { file, tabs } = tabStateParams;
  const tabList: TabState[] = [];

  // Decode active file
  const activeFileId = getFileId(content, file);

  // Decode tab list
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
}: {
  tabList: Array<TabState>;
  activeFileId: FileId | null;
  content: VZCodeContent;
}): TabStateParams => {
  // Get the file name of the active file
  const activeFileName = getFileName(content, activeFileId);

  const params: TabStateParams = {};

  // If that's missing, no need to proceed (should never happen).
  if (activeFileName) {
    // In any case we set the `file` parameter.
    params.file = activeFileName;

    // We only need to encode the `tabs` parameter
    // if there's more than one tab.
    if (tabList.length > 1) {
      // Set tab list
      const tabs = tabList
        .map((tabstate: TabState) =>
          getFileName(content, tabstate.fileId),
        )
        .join(delimiter);
      params.tabs = tabs;
    }
  }

  return params;
};
