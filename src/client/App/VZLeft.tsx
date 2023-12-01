import { useContext } from 'react';
import { VZSettings } from '../VZSettings';
import { VZSidebar } from '../VZSidebar';
import { VZCodeContext } from './VZCodeContext';

// The middle portion of the VZCode environment, containing:
// * The sidebar
// * The settings modal
export const VZLeft = () => {
  // TODO leverage this context in deeper levels of the component tree.
  const {
    files,
    createFile,
    renameFile,
    deleteFile,
    deleteDirectory,
    activeFileId,
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
  } = useContext(VZCodeContext);

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
