import { useCallback } from 'react';
import { FileTreePath } from '../types';
import { VizFileId, VizContent } from '@vizhub/viz-types';
import { randomId } from '../randomId';
import { EditorCache } from './useEditorCache';
import { getFileExtension } from './utils/fileExtension';
import { getLanguageExtension } from './CodeEditor/getOrCreateEditor';
import { editorCacheKey } from './useEditorCache';

// CRUD operations for files and directories
// CRUD = Create, Read, Update, Delete
export const useFileCRUD = ({
  submitOperation,
  closeTabs,
  openTab,
  editorCache,
  content,
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
  editorCache: EditorCache;
  content: VizContent;
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

      const oldName = content.files[fileId].name;
      const oldExtension = getFileExtension(oldName);

      const newExtension = getFileExtension(newName);

      const didExtensionChange =
        newExtension !== oldExtension;
      if (didExtensionChange) {
        // Update the language compartment of the corresponding CodeMirror editor
        // with the new language, based on the new extension, only if it changed.
        // Search through all cached editors for this file ID
        for (const [
          cacheKey,
          cachedEditor,
        ] of editorCache.entries()) {
          // Check if this cache entry is for the current file
          if (cacheKey.startsWith(fileId + '|')) {
            if (
              cachedEditor &&
              cachedEditor.languageCompartment
            ) {
              const newLanguageExtension =
                getLanguageExtension(newExtension);

              // Reconfigure the language compartment with the new language extension
              cachedEditor.editor.dispatch({
                effects:
                  cachedEditor.languageCompartment.reconfigure(
                    newLanguageExtension
                      ? [newLanguageExtension]
                      : [],
                  ),
              });
              // Continue to update all instances of this file in different panes
            }
          }
        }
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
