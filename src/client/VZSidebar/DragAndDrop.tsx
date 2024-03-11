import { useState, useContext, useCallback } from 'react';
import { VZCodeContext } from '../VZCodeContext';
import './styles.scss';

const debug = false;

export const DragAndDrop = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { createFile } = useContext(VZCodeContext);

  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragOver = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!isDragOver) setIsDragOver(true);
    },
    [isDragOver],
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
    },
    [],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
      const files = event.dataTransfer.files;

      if (debug) {
        console.log(files);
      }

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (readEvent) => {
          createFile(
            file.name,
            readEvent.target.result as string,
          );
        };
        reader.onerror = (error) => {
          console.error('Error reading file:', error);
        };
        reader.readAsText(file);
      });
    },
    [createFile],
  );

  return (
    <div
      className={`drop-zone ${isDragOver ? 'dragover' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      Drag files here
    </div>
  );
};
