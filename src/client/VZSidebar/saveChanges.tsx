// Some file handling component
import { useContext } from 'react';
import { VZCodeContext } from '../VZCodeContext';

const FileEditor = () => {
  const { saveChanges } = useContext(VZCodeContext);

  const handleFileChange = (newContent) => {
    // Handle file content change logic...
    saveChanges(); // Trigger saving process
  };

  return (
    <div className="file-editor">
      <textarea
        value={useContext}
        onChange={saveChanges}
        className="file-editor-textarea"
      />
    </div>
  );
};

export default FileEditor;
