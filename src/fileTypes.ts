// FileId
//   * A unique ID for a file.
//   * This is a random string.
export type FileId = string;

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
