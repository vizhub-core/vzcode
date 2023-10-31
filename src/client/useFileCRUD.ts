import { useCallback, useState } from 'react';
import { FileId, VZCodeContent } from '../types';
import { randomId } from '../randomId';
import { CreateFileModal } from './VZSidebar/CreateFileModal'

// CRUD operations for files and directories
// CRUD = Create, Read, Update, Delete
export const useFileCRUD = ({
  submitOperation,
  closeTabs,
  openTab,
  focusEditor,
}) => {

  const [modalVisible, setModalVisible] = useState(false);

  const createFile = useCallback((fileName) => {
    // TODO use Bootstrap modals not native prompts
    // See https://github.com/vizhub-core/vzcode/issues/252
    //const name = prompt('Enter new file name');
    
    console.log("Here's filename in createFile- ", fileName)
    
    if (fileName) {
      const fileId: FileId = randomId();
      submitOperation((document: VZCodeContent) => ({
        ...document,
        files: {
          ...document.files,
          [fileId]: { fileName, text: '' },
        },
      }));
      // When a new file is created, open it in a new tab
      // and focus the editor on it.
      openTab({ fileId, isTransient: false });
    }
  }, [submitOperation]);

  // Called when a file in the sidebar is renamed.
  const handleRenameFileClick = useCallback(
    (fileId: FileId, newName: string) => {
      submitOperation((document) => ({
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
    (path: FileId) => {
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

  // Generic delete function that calls either deleteFile or deleteDirectory
  // TODO consider if there is a cleaner way to do this
  //  - Ideally we would have a separate function for deleting files and directories
  //  - When we click the delete button, we should be able to tell if it is a file or directory
  const handleDeleteClick = useCallback(
    (key: string) => {
      // Regex to identify if the key is a file path or a file id.
      if (/^[0-9]*$/.test(key)) {
        if (key.length == 8) {
          deleteFile(key);
        } else {
          deleteDirectory(key);
        }
      } else {
        deleteDirectory(key);
      }
    },
    [deleteFile, deleteDirectory],
  );

  return {
    createFile,
    handleRenameFileClick,
    handleDeleteClick,
    modalVisible,
  };
};
