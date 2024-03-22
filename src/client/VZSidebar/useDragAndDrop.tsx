import { useState, useCallback } from 'react';

export const useDragAndDrop = (
  onDrop: (event: React.DragEvent) => void,
  onDragOver?: (event: React.DragEvent) => void,
  onDragEnter?: (event: React.DragEvent) => void,
  onDragLeave?: (event: React.DragEvent) => void
) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (onDragOver) {
        onDragOver(event);
      }
      setIsDragOver(true);
    },
    [onDragOver]
  );

  const handleDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (onDragEnter) {
        onDragEnter(event);
      }
      setIsDragOver(true);
    },
    [onDragEnter]
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (onDragLeave) {
        onDragLeave(event);
      }
      setIsDragOver(false);
    },
    [onDragLeave]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
      onDrop(event);
    },
    [onDrop]
  );

  return {
    dragOverProps: {
      className: `drop-zone ${isDragOver ? 'dragover' : ''}`,
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
};
