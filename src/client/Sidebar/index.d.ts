import './styles.scss';
import { Files } from '../../types';
export declare const Sidebar: ({
  createFile,
  files,
  handleRenameFileClick,
  handleDeleteFileClick,
  handleFileClick,
  setIsSettingsOpen,
  isSettingsOpen,
}: {
  createFile: () => void;
  files: Files;
  handleRenameFileClick: (fileId: string) => void;
  handleDeleteFileClick: (fileId: string) => void;
  handleFileClick: (fileId: string) => void;
  setIsSettingsOpen: (isSettingsOpen: boolean) => void;
  isSettingsOpen: boolean;
}) => import('react/jsx-runtime').JSX.Element;
