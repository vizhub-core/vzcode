import { Files, Username } from '../../types';
import { VZSettings } from '../VZSettings';
import { VZSidebar } from '../VZSidebar';
import { ThemeLabel } from '../themes';

export const Left = ({
  files,
  createFile,
  renameFile,
  deleteFile,
  deleteDirectory,
  openTab,
  closeTabs,
  isSettingsOpen,
  setIsSettingsOpen,
  closeSettings,
  theme,
  setTheme,
  username,
  setUsername,
  isDirectoryOpen,
  toggleDirectory,
  activeFileId,
}: {
  files: Files | null;
  createFile: (fileName: string) => void;
  renameFile: (fileId: string, fileName: string) => void;
  deleteFile: (fileId: string) => void;
  deleteDirectory: (directoryId: string) => void;
  openTab: ({
    fileId,
    isTransient,
  }: {
    fileId: string;
    isTransient?: boolean;
  }) => void;
  closeTabs: (fileIds: string[]) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isSettingsOpen: boolean) => void;
  closeSettings: () => void;
  theme: ThemeLabel;
  setTheme: (theme: ThemeLabel) => void;
  username: Username;
  setUsername: (username: Username) => void;
  isDirectoryOpen: (path: string) => boolean;
  toggleDirectory: (path: string) => void;
  activeFileId: string | null;
}) => {
  return (
    <div className="left">
      <VZSidebar
        files={files}
        createFile={createFile}
        renameFile={renameFile}
        deleteFile={deleteFile}
        deleteDirectory={deleteDirectory}
        openTab={openTab}
        closeTabs={closeTabs}
        setIsSettingsOpen={setIsSettingsOpen}
        isDirectoryOpen={isDirectoryOpen}
        toggleDirectory={toggleDirectory}
        activeFileId={activeFileId}
      />
      <VZSettings
        show={isSettingsOpen}
        onClose={closeSettings}
        theme={theme}
        setTheme={setTheme}
        username={username}
        setUsername={setUsername}
      />
    </div>
  );
};
