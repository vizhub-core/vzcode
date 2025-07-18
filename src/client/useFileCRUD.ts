import { useCallback } from 'react';
import { FileTreePath } from '../types';
import { VizFileId, VizContent } from '@vizhub/viz-types';
import { randomId } from '../randomId';

// CRUD operations for files and directories
// CRUD = Create, Read, Update, Delete
export const useFileCRUD = ({
  submitOperation,
  closeTabs,
  openTab,
  editorCache,
  content
}: {
  submitOperation: (
    operation: (document: VizContent) => VizContent,
  ) => void;
  closeTabs: (idsToDelete: Array<VizFileId>) => void;
  openTab: ({
    fileId,
    isTransient,
  }: {
    fileId: VizFileId;
    isTransient: boolean;
  }) => void;
  editorCache:any ;// TODO proper type
  content:any // TODO type
}) => {
  // Create a new file
  const createFile = useCallback(
    (name: string, text = '') => {
      if (name) {
        const fileId: VizFileId = randomId();
        submitOperation((document: VizContent) => ({
          ...document,
          files: {
            ...document.files,
            [fileId]: { name, text },
          },
        }));
        // When a new file is created, open it in a new tab
        // and focus the editor on it.
        openTab({ fileId, isTransient: false });
      }
    },
    [submitOperation],
  );

  const createDirectory = useCallback(
    (name: string, text = null) => {
      if (name) {
        name += '/';
        const fileId: VizFileId = randomId();
        submitOperation((document: VizContent) => ({
          ...document,
          files: {
            ...document.files,
            [fileId]: { name, text },
          },
        }));
      }
    },
    [submitOperation],
  );

  // Called when a file in the sidebar is renamed.
  const renameFile = useCallback(
    (fileId: VizFileId, newName: string) => {
      submitOperation((document: VizContent) => ({
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

      // TODO refactor into a shared module, 
      // and use from src/client/CodeEditor/getOrCreateEditor.ts
      const getExtension = (name:string)=> name.split('.').pop();

      const oldName = content.files[fileId].name;
       const oldExtension = getExtension(oldName)
     
      const newExtension = getExtension(newName)
     
      const didExtensionChange = newExtension !== oldExtension;
      if(didExtensionChange){
        // TODO update the language compartment of the
        // corresponding CodeMirror editor with the new
        // language, based on the new extension, only if it changed.
        // use editorCache to access the instance
        // See theme changing as a reference
        // editor.dispatch({
        //           effects: themeCompartment.reconfigure([
        //             themeOptionsByLabel[theme].value,
        //           ]),
        //         });
      }
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
      submitOperation((document: VizContent) => {
        const updatedFiles = Object.keys(
          document.files,
        ).reduce((acc, key) => {
          const file = document.files[key];
          const fileName = file.name;
          //See if it's actually in directory
          if (fileName.includes(path + '/')) {
            //Create New Name for System
            const pathPart = fileName.substring(
              0,
              fileName.indexOf(path) + path.length,
            );
            const oldNamePos =
              pathPart.lastIndexOf(oldName);
            const fileNewName =
              fileName.substring(0, oldNamePos) +
              newName +
              fileName.substring(
                oldNamePos + oldName.length,
              );
            //Return with new names
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
    (fileId: VizFileId) => {
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
      const tabsToClose: Array<VizFileId> = [];
      submitOperation((document: VizContent) => {
        const updatedFiles = { ...document.files };
        for (const key in updatedFiles) {
          if (updatedFiles[key].name.includes(path + '/')) {
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
    createDirectory,
    renameDirectory,
    deleteDirectory,
  };
};
