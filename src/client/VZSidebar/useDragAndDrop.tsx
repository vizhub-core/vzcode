import { useState, useContext, useCallback } from 'react';
import { VZCodeContext } from '../VZCodeContext';
import './styles.scss';

const debug = false;

export const useDragAndDrop = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null); // Track the dragged item
  const { createFile } = useContext(VZCodeContext);

  const handleDragStart = useCallback((itemId: string) => {
    setDraggedItemId(itemId);
  }, []);

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

  // Handle dropping for file reordering or external file upload
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>, dropTargetId: string | null = null, onReorderItems?: (draggedId: string, dropTargetId: string) => void) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      // If dragging within sidebar, reorder items
      if (draggedItemId && dropTargetId && onReorderItems) {
        onReorderItems(draggedItemId, dropTargetId);
        setDraggedItemId(null);
        return;
      }

      // Otherwise, handle external file drop
      const items = event.dataTransfer.items;
      const processEntry = (entry, path) => {
        if (entry.isFile) {
          entry.file((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const content = e.target.result as string;
              createFile(`${path}${file.name}`, content);
            };
            reader.readAsText(file);
          });
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();
          dirReader.readEntries((entries) => {
            const newPath = `${path}${entry.name}/`;
            for (const entry of entries) {
              processEntry(entry, newPath);
            }
          });
        }
      };

      const itemsArray = Array.from(items);
      itemsArray.forEach((item) => {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          processEntry(entry, '');
        }
      });
    },
    [createFile, draggedItemId],
  );

  return {
    isDragOver,
    handleDragStart, 
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};
