export type FileId = string;
export interface Files {
  [fileId: FileId]: File;
}
export interface File {
  name: string;
  text: string;
}
