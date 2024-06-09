// FileId
//   * A unique ID for a file.
//   * This is a random string.
export type FileId = string;

// ItemId
//   * A unique ID for an item in the sidebar.
//   * This could be either a file ID or a directory path.
export type ItemId = FileId | FileTreePath;

// Files
//  * A collection of files.
//  * Keys are _not_ file names or array indices,
//    because based on past experience, that
//    leads to very difficult frontend logic around
//    OT in the case that a file is renamed or deleted.
//  * When the file name changes, or files are added/deleted,
//    this ID stays the same, simplifying things re:OT.
export interface Files {
  [fileId: FileId]: File;
}

// File
//  * A file with `name` and `text`.
export interface File {
  // The file name.
  // e.g. "index.html".
  name: string;

  // The text content of the file.
  // e.g. "<body>Hello</body>"
  text: string;
}

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
  fileId: FileId;
}

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
};

// A unique ID for an AI stream.
// Generated by the client.
export type AIStreamId = string;

// // TODO define this interface.
// export type AIStreamStatus = {
//   // This field is managed by the client.
//   //  * `true` if the client wants the server to start the generation.
//   //  * `false` if the client does not want the server to start the generation.
//   clientWantsToStart: boolean;

//   // This field is managed by the server.
//   //  * `true` if the server is running the generation.
//   //  * `false` if the server is not running the generation.
//   serverIsRunning: boolean;

//   text: string;

//   startingInsertionCursor: number;
//   fileId: FileId;
// };

/// Alternative universe

// // // If the generation started yet or not
// // //  * If not, the server will start it.
// // started: boolean;

// // Required?
// // aiStreamId: AIStreamId

// // The generation status
// //  * "running" if the generation is running
// //  * "finished" if the generation is finished
// //  * "error" if the generation errored
// //  * "stopped" if the generation was stopped
// status:
//   | 'unstarted'
//   | 'running'
//   | 'finished'
//   | 'error'
//   | 'stopped';

// // Possible states:
// //  * { started: 'unstarted' } - client added this,
// //    It should trigger the server to start the generation.
// //  * { status: 'running' } - server added this,
// //    It indicates that the generation is running.
// //  * { status: 'finished' } - server added this,
// //    It indicates that the generation is finished.
// //  * { status: 'stopped' } - server added this,
// //    It indicates that the generation was stopped.
// //
// // After `status` transitions to `finished` or `stopped`,

// The ShareDB document type for VZCode.
export type VZCodeContent = {
  // `files`
  //   * The files in the VZCode instance.
  files?: Files;

  // `isInteracting`
  //   * `true` when the user is interacting
  //     via interactive code widgets (e.g. Alt+drag)
  //     * Hot reloading is throttled when this is `true`.
  //   * `false` or `undefined` when they are not (e.g. normal typing)
  //     * Hot reloading is debounced when this is `false`.
  isInteracting?: boolean;

  // `aiStreams`
  //  * The AI streams in the VZCode instance.
  //  * Keys are AI stream IDs.
  //  * Values are AI streams.
  // What is this for?
  //  * Synchronize the status of streams between the
  //    client and server.
  //  * This can power the transition of the icon from
  //    lightning bolt to stop sign and back (when stream finishes)
  // aiStreams?: {
  //   // These need to be removed at some point?
  //   [aiStreamId: AIStreamId]: {
  //     AIStreamStatus: AIStreamStatus;
  //   };
  // };

  // TODO consider is there a way to replace the HTTP request to
  // the AIAssist endpoint with a manipulation of the ShareDB document?
};

// An id used for presence.
export type PresenceId = string;

// A user name for display in presence.
export type Username = string;

// The type of a convenience function called `submitOperation`,
// to submit an operation to ShareDB.
export type SubmitOperation = (
  next: (content: VZCodeContent) => VZCodeContent,
) => void;
