import { useCallback, useState } from 'react';
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
}: {
  submitOperation: (
    operation: (document: VZCodeContent) => VZCodeContent,
  ) => void;
  closeTabs: (idsToDelete: Array<FileId>) => void;
  openTab: ({
    fileId,
    isTransient,
  }: {
    fileId: FileId;
    isTransient: boolean;
  }) => void;
}) => {
  // Create a new file
  const createFile = useCallback(
    (name: string) => {
      if (name) {
        const fileId: FileId = randomId();
        submitOperation((document: VZCodeContent) => ({
          ...document,
          files: {
            ...document.files,
            [fileId]: { name, text: '' },
          },
        }));
        // When a new file is created, open it in a new tab
        // and focus the editor on it.
        openTab({ fileId, isTransient: false });
      }
    },
    [submitOperation],
  );

  // Called when a file in the sidebar is renamed.
  const renameFile = useCallback(
    (fileId: FileId, newName: string) => {
      submitOperation((document: VZCodeContent) => ({
        ...document,
        files: {
          ...document.files,
          [fileId]: {
            ...document.files[fileId],
            name:
              document.files[fileId].name.substring(
                0,
                document.files[fileId].name.lastIndexOf(
                  '/',
                ) + 1,
              ) + newName,
          },
        },
      }));
    },
    [submitOperation],
  );

  // Renames a directory
  const renameDirectory = useCallback(
    (
      path: FileTreePath,
      oldName: string,
      newName: string,
    ) => {
      submitOperation((document: VZCodeContent) => {
        const updatedFiles = Object.keys(
          document.files,
        ).reduce((acc, key) => {
          const file = document.files[key];
          const fileName = file.name;
          if (fileName.includes(path)) {
            const oldNamePos = fileName.indexOf(oldName);
            const fileNewName =
              fileName.substring(0, oldNamePos) +
              newName +
              fileName.substring(
                oldNamePos + oldName.length,
              );
            acc[key] = { ...file, name: fileNewName };
          } else {
            acc[key] = file;
          }
          return acc;
        }, {});

        return { ...document, files: updatedFiles };
      });
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
    renameDirectory,
    deleteDirectory,
  };
};
