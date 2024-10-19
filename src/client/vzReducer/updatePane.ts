import {
  FileId,
  Pane,
  PaneId,
  TabState,
} from '../../types';

// Immutable update pattern for updating a pane's tab list.
export const updatePane = ({
  pane,
  activePaneId,
  newTabList,
  newActiveFileId,
}: {
  pane: Pane;
  activePaneId: PaneId;
  newTabList?: Array<TabState>;
  newActiveFileId?: FileId | null;
}): Pane =>
  pane.type === 'splitPane'
    ? {
        ...pane,
        children: pane.children.map((child) =>
          updatePane({
            pane: child,
            activePaneId,
            newTabList,
            newActiveFileId,
          }),
        ),
      }
    : pane.id === activePaneId
      ? {
          ...pane,
          tabList:
            newTabList !== undefined
              ? newTabList
              : pane.tabList,
          activeFileId:
            newActiveFileId !== undefined
              ? newActiveFileId
              : pane.activeFileId,
        }
      : pane;
