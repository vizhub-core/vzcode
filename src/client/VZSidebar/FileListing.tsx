import { useCallback, useContext } from 'react';
import { Item } from './Item';
import { FileId, PresenceIndicator } from '../../types';
import {
  FileSVG,
  JavaScriptSVG,
  TypeScriptSVG,
  ReactSVG,
  SvelteSVG,
  JsonSVG,
  MarkdownSVG,
  HtmlSVG,
  CssSVG,
} from '../Icons';
import { VZCodeContext } from '../VZCodeContext';
import { assignUserColor } from '../presenceColor';

export function getExtensionIcon(fileName: string) {
  const extension = fileName.split('.');

  switch (extension[extension.length - 1]) {
    case 'jsx':
    case 'tsx':
      return <ReactSVG />;
    case 'js':
      return <JavaScriptSVG />;
    case 'ts':
      return <TypeScriptSVG />;
    case 'json':
      return <JsonSVG />;
    case 'md':
      return <MarkdownSVG />;
    case 'html':
      return <HtmlSVG />;
    case 'css':
      return <CssSVG />;
    case 'svelte':
      return <SvelteSVG />;
    default:
      return <FileSVG />;
  }
}

export const FileListing = ({
  name,
  fileId,
  handleFileClick,
  handleFileDoubleClick,
  isActive,
  presence,
}: {
  name: string;
  fileId: FileId;
  handleFileClick: (fileId: FileId) => void;
  handleFileDoubleClick: (fileId: FileId) => void;
  isActive: boolean;
  presence: PresenceIndicator[];
}) => {
  const { renameFile, deleteFile } = useContext(VZCodeContext);

  const handleClick = useCallback(() => {
    handleFileClick(fileId);
  }, [fileId, handleFileClick]);

  const handleDoubleClick = useCallback(() => {
    handleFileDoubleClick(fileId);
  }, [fileId, handleFileDoubleClick]);

  const handleDeleteClick = useCallback(() => {
    deleteFile(fileId);
  }, [fileId, deleteFile]);

  const handleRenameClick = useCallback(
    (newName: string) => {
      renameFile(fileId, newName);
    },
    [fileId, renameFile],
  );

  return (
    <Item
      id={fileId}
      name={name}
      handleClick={handleClick}
      handleDoubleClick={handleDoubleClick}
      handleDeleteClick={handleDeleteClick}
      handleRenameClick={handleRenameClick}
      isActive={isActive}
    >
      {presence.length > 0 && (
        <div className="presence-indicators">
          {presence.map((indicator, index) => (
            <div
              key={index}
              className="presence-indicator"
              style={{ backgroundColor: 'blue' }} // Hardcoded color for testing
              //style={{ backgroundColor: assignUserColor(indicator.username) }}
            >
              {indicator.username[0]}
            </div>
          ))}
        </div>
      )}
      <i className="file-icon">{getExtensionIcon(name)}</i>
      {name}
    </Item>
  );
};

console.log(assignUserColor('bill'));
