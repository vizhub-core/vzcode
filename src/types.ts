import { VizContent, VizFileId } from '@vizhub/viz-types';

// TODO adopt new types from @vizhub/viz-types across the codebase:
//  * FileId --> VizFileId
//  * File --> VizFile
//  * Files --> VizFiles
//  * VZCodeContent --> VizContent

// ItemId
//   * A unique ID for an item in the sidebar.
//   * This could be either a file ID or a directory path.
export type ItemId = VizFileId | FileTreePath;

// FileTreePath
//  * The path to the directory, e.g. "src/components", OR
//  * The path to the file e.g. "src/components/HelloWorld.js".
export type FileTreePath = string;

// FileTree
//  * A tree of files.
//  * Each node in the tree is either a directory or a file.
//  * Each directory has a `children` array.
//  * Each file has a `file` object.
//  * Each file has a `fileId` string.
//  * Each directory has a `name` string.
//  * Each directory has a `path` string.
export interface FileTree {
  name: string;
  path?: FileTreePath;
  children?: Array<FileTree | FileTreeFile>;
}

// FileTreeFile
//  * A file in a file tree.
//  * Each file has a `name` string.
//  * Each file has a `file` object.
//  * Each file has a `fileId` string.
export interface FileTreeFile {
  name: string;
  file: File;
  fileId: VizFileId;
}
export type SearchMatch = Array<{
  line: number;
  index: number;
  text: string;
}>;
export type SearchFileVisibility =
  | 'open'
  | 'flattened'
  | 'closed';
export type SearchResult = { [id: string]: SearchFile };

export interface SearchFile {
  name: string;
  matches: SearchMatch;
  visibility: SearchFileVisibility;
}
export interface SearchResults {
  pattern: string;
  results: SearchResult;
  focusedIndex: number | null;
  focusedChildIndex: number | null;
  focused: boolean;
}

// Representation of an open tab.
export type TabState = {
  // `fileId`
  // The ID of the file that the tab represents.
  fileId: VizFileId;

  // `isTransient`
  // Represents whether the tab is temporary or persistent.
  //  * `true` if the tab is temporary, meaning its text
  //    appears as italic, and it will be automatically
  //    closed when the user switches to another file.
  //    If `true` and the tab is opened, the editor will not focus.
  //  * `false` or `undefined` if the tab is persistent, meaning its text
  //    appears as normal, and it will not be automatically
  //    closed when the user switches to another file.
  //    If `false` and the tab is opened, the editor will focus.
  isTransient?: boolean;
};

// PaneId
//   * A unique ID for a pane.
//   * This is a random string.
export type PaneId = string;

// The leaf node of the tree data structure
export type LeafPane = {
  type: 'leafPane';
  // The list of tabs
  // Mutually exclusive with `children`.
  tabList: Array<TabState>;

  // The ID of the file that is currently active
  // within this leaf pane.
  // Invariant: `activeFileId` is always in `tabList`.
  activeFileId: VizFileId | null;
};

// Internal node of the tree data structure
export type SplitPane = {
  type: 'splitPane';

  // Which orientation is it? Vertical split or horizontal split?
  // Applies only to `children`
  orientation: 'vertical' | 'horizontal';

  // The children panels
  // Mutually exclusive with `tabList`.
  children: Array<Pane>;
};

// The node data structure of the split pane tree
export type Pane = {
  // Every pane gets a unique ID,
  // so we can refer to it in actions.
  id: PaneId;

  // The type of the pane
  // Either a leaf pane or a split pane.
  type: 'leafPane' | 'splitPane';
} & (LeafPane | SplitPane);

export type JSONOp = any;

// `ShareDBDoc`
// A ShareDB Document.
// TODO better types? Integrate with upstream how?
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/sharedb/lib/sharedb.d.ts#L110
export type ShareDBDoc<T> = {
  data: T;
  ingestSnapshot: (snapshot: any, callback) => void;
  subscribe: (callback) => void;
  on: (
    event: string,
    callback: (op: JSONOp, source: boolean) => void,
  ) => void;
  off: (
    event: string,
    callback: (op: JSONOp, source: boolean) => void,
  ) => void;
  removeListener: (
    event: string,
    callback: (op: JSONOp, source: boolean) => void,
  ) => void;
  submitOp: (
    op: JSONOp,
    options?: any,
    callback?: () => void,
  ) => void;
  whenNothingPending: (callback: () => void) => void;
};

// Example Presence object, from ShareDB:
// {
//   "start": [
//     "files",
//     "71898298",
//     "text",
//     415
//   ],
//   "end": [
//     "files",
//     "71898298",
//     "text",
//     415
//   ],
//   "username": "Tim"
// }
export type Presence = {
  start: Array<string | number>;
  end: Array<string | number>;
  username: Username;
};

// An item in the list of sidebar presence indicators.
// It needs to know:
// * What user the presence is associated with
// * What file the presence is associated with
export type PresenceIndicator = {
  username: Username;
  fileId: VizFileId;
};

// An id used for presence.
export type PresenceId = string;

// A user name for display in presence.
export type Username = string;

// The type of a convenience function called `submitOperation`,
// to submit an operation to ShareDB.
export type SubmitOperation = (
  next: (content: VizContent) => VizContent,
) => void;
