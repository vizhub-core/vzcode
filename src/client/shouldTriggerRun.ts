// This module is responsible for checking
// keyboard events and determining whether
// a run should be triggered or not.
export const shouldTriggerRun = (event: KeyboardEvent) => {
  const isMac = /Mac|iMac|MacBook/i.test(
    navigator.userAgent,
  );
  const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

  if (ctrlOrCmd && event.key === 's') {
    // Save
    return true;
  } else if (
    event.key === 'F5' || // Run (F5)
    (ctrlOrCmd && event.key === 'Enter') || // Ctrl+Enter or Cmd+Enter
    (event.shiftKey && event.key === 'Enter') || // Shift+Enter
    // Let's not override the browser's default behavior for refresh page.
    // (ctrlOrCmd && event.key === 'r') || // Ctrl+R or Cmd+R

    (event.altKey && event.key === 'Enter') || // Alt+Enter
    (ctrlOrCmd &&
      event.shiftKey &&
      (event.key === 'B' || event.key === 'b')) || // Ctrl+Shift+B or Cmd+Shift+B
    (ctrlOrCmd && event.shiftKey && event.key === 'F10') || // Ctrl+Shift+F10 or Cmd+Shift+F10
    event.key === 'F8' ||
    event.key === 'F9'
  ) {
    return true;
  }
  return false;
};
