import { useCallback } from 'react';
import {
  FileId,
  FileTreePath,
  VZCodeContent,
} from '../types';
import { randomId } from '../randomId';

// CRUD operations for files and directories
// CRUD = Create, Read, Update, Delete
export const useFileCRUD = ({
  submitOperation,
  closeTabs,
  openTab,
  focusEditor,
}) => {
  // Create a new file
  const createFile = useCallback(() => {
    // TODO use Bootstrap modals not native prompts
    // See https://github.com/vizhub-core/vzcode/issues/252
    const name = prompt('Enter new file name');
    if (name) {
      const newFileId: FileId = randomId();
      submitOperation((document: VZCodeContent) => ({
        ...document,
        files: {
          ...document.files,
          [newFileId]: { name, text: '' },
        },
      }));
      openTab(newFileId);

      focusEditor(newFileId);
    }
  }, [submitOperation]);

  // Called when a file in the sidebar is renamed.
  const renameFile = useCallback(
    (fileId: FileId, newName: string) => {
      submitOperation((document: VZCodeContent) => ({
        ...document,
        files: {
          ...document.files,
          [fileId]: {
            ...document.files[fileId],
            name: newName,
          },
        },
      }));
    },
    [submitOperation],
  );

  // Deletes a file
  const deleteFile = useCallback(
    (fileId: FileId) => {
      closeTabs([fileId]);
      submitOperation((document) => {
        const updatedFiles = { ...document.files };
        delete updatedFiles[fileId];
        return { ...document, files: updatedFiles };
      });
    },
    [submitOperation, closeTabs],
  );

  // Deletes a directory and all files within it
  const deleteDirectory = useCallback(
    (path: FileTreePath) => {
      const tabsToClose: Array<FileId> = [];
      submitOperation((document: VZCodeContent) => {
        const updatedFiles = { ...document.files };
        for (const key in updatedFiles) {
          if (updatedFiles[key].name.includes(path)) {
            tabsToClose.push(key);
            delete updatedFiles[key];
          }
        }
        return { ...document, files: updatedFiles };
      });
      closeTabs(tabsToClose);
    },
    [submitOperation, closeTabs],
  );

  return {
    createFile,
    renameFile,
    deleteFile,
    deleteDirectory,
  };
};
