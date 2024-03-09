import React, { useState, useContext } from 'react';
import { VZCodeContext } from '../VZCodeContext';
import './styles.scss'; 

export const DragAndDrop = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { createFileWithContent } = useContext(VZCodeContext);

  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    console.log(files);
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = readEvent => {
        
        createFileWithContent(file.name, readEvent.target.result);
      };
      reader.readAsText(file); 
    });
  };

  return (
    <div className="sidebar">
      <div className={`dropZone ${isDragOver ? 'dragover' : ''}`}
           onDragEnter={handleDragEnter}
           onDragOver={handleDragOver}
           onDragLeave={handleDragLeave}
           onDrop={handleDrop}>
        Drag files here
      </div>
    </div>
  );
};