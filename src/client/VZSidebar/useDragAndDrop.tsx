import { useState, useContext, useCallback } from 'react';
import { VZCodeContext } from '../VZCodeContext';
import './styles.scss';

const debug = false;

export const useDragAndDrop = (setDropTargetIndex: (index: number | null) => void) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null); // Track the dragged item ID
  const { createFile } = useContext(VZCodeContext);

  const handleDragStart = useCallback((itemId: string) => {
    setDraggedItemId(itemId); // Track which item is being dragged
  }, []);

  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragOver = useCallback(
    (event: React.DragEvent, itemId: string | null = null) => {
      event.preventDefault();
      event.stopPropagation();
      if (!isDragOver) setIsDragOver(true);

      if (itemId) {
        const index = parseInt(itemId);
        setDropTargetIndex(index);
      }
    },
    [isDragOver, setDropTargetIndex]
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
      setDropTargetIndex(null); // Clear drop target index
    },
    [setDropTargetIndex],
  );

  const handleDrop = useCallback(
    (
      event: React.DragEvent<HTMLDivElement>,
      dropTargetId: string | null = null,
      onReorderItems?: (draggedId: string, dropTargetId: string) => void
    ) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      // If dragging within the sidebar, reorder items
      if (draggedItemId && dropTargetId && onReorderItems) {
        onReorderItems(draggedItemId, dropTargetId);
        setDraggedItemId(null);
        setDropTargetIndex(null);
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
    [createFile, draggedItemId, setDropTargetIndex],
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
