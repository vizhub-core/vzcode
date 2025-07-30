import { useContext } from 'react';
import { VZCodeContext } from '../VZCodeContext';
import './style.scss';

export const ImageViewer = () => {
  const { activePane, content } = useContext(VZCodeContext);

  // Get the active file
  const activeFileId = activePane?.activeFileId;
  const activeFile = activeFileId && content?.files?.[activeFileId];

  if (!activeFile) {
    return <div className="image-viewer-error">No file selected</div>;
  }

  // Check if it's an image file based on extension
  const isImageFile = activeFile.name.match(/\.(png|jpg|jpeg|gif|bmp|svg|webp)$/i);
  
  if (!isImageFile) {
    return <div className="image-viewer-error">Not an image file</div>;
  }

  // Get the MIME type from the file extension
  const getImageMimeType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'bmp':
        return 'image/bmp';
      case 'svg':
        return 'image/svg+xml';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/png'; // fallback
    }
  };

  const mimeType = getImageMimeType(activeFile.name);
  const extension = activeFile.name.split('.').pop()?.toLowerCase();
  
  // For SVG files, the content might already be the SVG text, not base64
  const imageSrc = extension === 'svg' && !activeFile.text.startsWith('PHN2Zw') // Check if it's not base64-encoded SVG
    ? `data:${mimeType};utf8,${encodeURIComponent(activeFile.text)}`
    : `data:${mimeType};base64,${activeFile.text}`;

  return (
    <div className="image-viewer">
      <div className="image-viewer-header">
        <h3 className="image-viewer-title">{activeFile.name}</h3>
      </div>
      <div className="image-viewer-content">
        <img 
          src={imageSrc} 
          alt={activeFile.name}
          className="image-viewer-img"
          onError={(e) => {
            console.error('Failed to load image:', activeFile.name);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    </div>
  );
};