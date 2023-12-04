import { useCallback } from 'react';
import {
  FileId,
  FileTreePath,
  VZCodeContent,
  Directory
} from '../types';
import { randomId } from '../randomId';

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
        openTab({ fileId, isTransient: false });
      }
    },
    [submitOperation, openTab],
  );

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

  // Update createDirectory function to use the Directory type
const createDirectory = useCallback(
  (name: string) => {
    if (name) {
      const fileId: FileId = randomId();
      const directoryPath: FileTreePath = name;
      submitOperation((document: VZCodeContent) => {
        return {
          ...document,
          files: {
            ...document.files,
            [fileId]: { name: directoryPath, isDirectory: true, files: {} } as Directory,
          },
        };
      });
    }
  },
  [submitOperation],
);
  

  return {
    createFile,
    createDirectory,
    renameFile,
    deleteFile,
    deleteDirectory,
  };
};
