import { useState, useContext, useCallback } from 'react';
import { VZCodeContext } from '../VZCodeContext';
import './styles.scss';
import { FALSE } from 'sass';

interface FileSystemEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  createReader: () => FileSystemDirectoryReader;
  file: (callback: (file: File) => void) => void;
}

interface FileSystemDirectoryReader {
  readEntries: (
    callback: (entries: FileSystemEntry[]) => void,
  ) => void;
}

const DEBUG = FALSE;

export const useDragAndDrop = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { createFile } = useContext(VZCodeContext);

  const handleDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      DEBUG && console.log('[useDragAndDrop] Drag Enter');
      setIsDragOver(true);
    },
    [],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      DEBUG && console.log('[useDragAndDrop] Drag Over');
      if (!isDragOver) setIsDragOver(true);
    },
    [isDragOver],
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      DEBUG && console.log('[useDragAndDrop] Drag Leave');
      setIsDragOver(false);
    },
    [],
  );

  const isTextFile = (file: File): boolean => {
    // Add more text file types as needed
    const textTypes = [
      'text/',
      'application/json',
      'application/javascript',
      'application/typescript',
      'application/xml',
      'application/x-httpd-php',
    ];
    const isText =
      textTypes.some((type) =>
        file.type.startsWith(type),
      ) ||
      file.name.match(
        /\.(txt|js|jsx|ts|tsx|md|css|scss|html|xml|json|php|py|rb|java|c|cpp|h|hpp)$/i,
      ) !== null;

    DEBUG &&
      console.log(
        `[useDragAndDrop] File ${file.name} is${isText ? '' : ' not'} a text file`,
      );
    return isText;
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      DEBUG &&
        console.log(
          `[useDragAndDrop] Reading file: ${file.name}`,
        );

      if (!isTextFile(file)) {
        DEBUG &&
          console.log(
            `[useDragAndDrop] Rejected non-text file: ${file.name}`,
          );
        reject(
          new Error(`File ${file.name} is not a text file`),
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          DEBUG &&
            console.log(
              `[useDragAndDrop] Successfully read file: ${file.name}`,
            );
          resolve(e.target.result as string);
        } else {
          DEBUG &&
            console.log(
              `[useDragAndDrop] Failed to read file: ${file.name}`,
            );
          reject(
            new Error(`Failed to read file ${file.name}`),
          );
        }
      };
      reader.onerror = () => {
        DEBUG &&
          console.log(
            `[useDragAndDrop] Error reading file: ${file.name}`,
          );
        reject(
          new Error(`Error reading file ${file.name}`),
        );
      };
      reader.readAsText(file);
    });
  };

  const processEntry = async (
    entry: FileSystemEntry,
    path: string,
  ): Promise<void> => {
    try {
      DEBUG &&
        console.log(
          `[useDragAndDrop] Processing entry: ${entry.name} at path: ${path}`,
        );

      if (entry.isFile) {
        DEBUG &&
          console.log(
            `[useDragAndDrop] Processing file: ${entry.name}`,
          );
        entry.file(async (file) => {
          try {
            const content = await readFileAsText(file);
            DEBUG &&
              console.log(
                `[useDragAndDrop] Creating file: ${path}${file.name}`,
              );
            createFile(`${path}${file.name}`, content);
          } catch (error) {
            console.error(
              `Error processing file ${file.name}:`,
              error,
            );
          }
        });
      } else if (entry.isDirectory) {
        DEBUG &&
          console.log(
            `[useDragAndDrop] Processing directory: ${entry.name}`,
          );
        return new Promise<void>((resolve) => {
          const dirReader = entry.createReader();
          const readEntries = () => {
            dirReader.readEntries(async (entries) => {
              if (entries.length === 0) {
                DEBUG &&
                  console.log(
                    `[useDragAndDrop] Finished reading directory: ${entry.name}`,
                  );
                resolve();
                return;
              }

              const newPath = `${path}${entry.name}/`;
              DEBUG &&
                console.log(
                  `[useDragAndDrop] Reading ${entries.length} entries in directory: ${newPath}`,
                );
              await Promise.all(
                entries.map((entry) =>
                  processEntry(entry, newPath),
                ),
              );
              readEntries(); // Continue reading if there are more entries
            });
          };
          readEntries();
        });
      }
    } catch (error) {
      console.error(
        `Error processing entry ${entry.name}:`,
        error,
      );
    }
  };

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      DEBUG &&
        console.log('[useDragAndDrop] Drop event started');
      setIsDragOver(false);
      setIsProcessing(true);

      try {
        const items = event.dataTransfer.items;
        DEBUG &&
          console.log(
            `[useDragAndDrop] Processing ${items.length} dropped items`,
          );
        const entries: FileSystemEntry[] = [];

        for (const item of Array.from(items)) {
          // Try webkit first, then fallback to other methods
          const entry =
            item.webkitGetAsEntry?.() ||
            (item as any).getAsEntry?.() ||
            (item as any).createEntry?.();

          if (entry) {
            DEBUG &&
              console.log(
                `[useDragAndDrop] Got entry for: ${entry.name}`,
              );
            entries.push(entry as FileSystemEntry);
          } else if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) {
              DEBUG &&
                console.log(
                  `[useDragAndDrop] Processing dropped file: ${file.name}`,
                );
              try {
                const content = await readFileAsText(file);
                createFile(file.name, content);
              } catch (error) {
                console.error(
                  `Error processing file ${file.name}:`,
                  error,
                );
              }
            }
          }
        }

        DEBUG &&
          console.log(
            `[useDragAndDrop] Processing ${entries.length} entries`,
          );
        await Promise.all(
          entries.map((entry) => processEntry(entry, '')),
        );
      } catch (error) {
        console.error(
          'Error processing dropped items:',
          error,
        );
      } finally {
        DEBUG &&
          console.log(
            '[useDragAndDrop] Drop processing completed',
          );
        setIsProcessing(false);
      }
    },
    [createFile],
  );

  return {
    isDragOver,
    isProcessing,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};
