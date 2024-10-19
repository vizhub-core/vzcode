import { Pane, PaneId } from '../../types';

// Recursively finds a pane by id, given a root pane node.
export const findPane = (
  pane: Pane,
  paneId: PaneId,
): Pane => {
  if (pane.id === paneId) {
    return pane;
  }
  if (pane.type === 'splitPane') {
    for (const child of pane.children) {
      const foundPane = findPane(child, paneId);
      if (foundPane) {
        return foundPane;
      }
    }
  }
};
