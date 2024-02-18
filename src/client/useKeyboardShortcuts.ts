import { useContext, useEffect } from 'react';
import { shouldTriggerRun } from './shouldTriggerRun';
import { VZCodeContext } from './VZCodeContext';

// This module implements the keyboard shortcuts
// for the VZCode editor.
// These include:
// * Alt-w: Close the current tab
// * Alt-n: Open the create file modal
// * Alt-PageUp: Change the active tab to the previous one
// * Alt-PageDown: Change the active tab to the next one
// * Ctrl-s or Shift-Enter: Run the code and format it with Prettier
export const useKeyboardShortcuts = ({
  closeTabs,
  activeFileId,
  handleOpenCreateFileModal,
  setActiveFileLeft,
  setActiveFileRight,
  runPrettierRef,
  runCodeRef,
}) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (shouldTriggerRun(event)) {
        event.preventDefault();

        // Run Prettier
        const runPrettier = runPrettierRef.current;
        if (runPrettier !== null) {
          runPrettier();
        }

        // Run the code
        const runCode = runCodeRef.current;
        if (runCode !== null) {
          runCode();
        }
        return;
      }

      if (event.altKey === true) {
        // Alt-w: Close the current tab
        if (event.key === 'w') {
          // TODO clean this up so we can remove `activeFileId`
          // as a dependency
          // TODO closeActiveTab()
          closeTabs([activeFileId]);
          return;
        }

        // Alt-n: Open the create file modal
        if (event.key === 'n') {
          handleOpenCreateFileModal();
          return;
        }

        // Alt-PageUp: Change the active tab to the previous one
        if (event.key === 'PageUp') {
          setActiveFileLeft();
          return;
        }

        // Alt-PageDown: Change the active tab to the next one
        if (event.key === 'PageDown') {
          setActiveFileRight();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyPress,
      );
    };
  }, [
    handleOpenCreateFileModal,
    closeTabs,
    activeFileId,
    setActiveFileLeft,
    setActiveFileRight,
  ]);
};
