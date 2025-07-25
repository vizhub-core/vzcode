// This module is responsible for checking
// keyboard events and determining whether
// a run should be triggered or not.
export const shouldTriggerRun = (event: KeyboardEvent) => {
  const isMac = /Mac|iMac|MacBook/i.test(
    navigator.userAgent,
  );
  const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

  // Removed Ctrl+S to avoid Chrome save page conflict
  // Use F5, Ctrl+Enter, or Shift+Enter instead
  if (
    event.key === 'F5' || // Run (F5) - standard across many IDEs
    (ctrlOrCmd && event.key === 'Enter' && !event.shiftKey && !event.altKey) || // Ctrl+Enter or Cmd+Enter
    (event.shiftKey && event.key === 'Enter' && !event.ctrlKey && !event.metaKey && !event.altKey) || // Shift+Enter
    (event.altKey && event.key === 'Enter' && !event.ctrlKey && !event.metaKey && !event.shiftKey) || // Alt+Enter
    // Removed Ctrl+Shift+B to avoid Chrome bookmarks conflict
    (ctrlOrCmd && event.shiftKey && event.key === 'F10') || // Ctrl+Shift+F10 or Cmd+Shift+F10
    event.key === 'F8' || // F8 - common debug/run key
    event.key === 'F9'    // F9 - common debug/run key
  ) {
    return true;
  }
  return false;
};
