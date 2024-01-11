import { useEffect } from 'react';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { FileId } from '../types';
import { TabState } from './vzReducer';

export interface EditorTabsState {
  // The ID of the file that is currently active.
  // Invariant: `activeFileId` is always in `tabList`.
  activeFileId: FileId | null;

  // The list of open tabs.
  tabList: Array<TabState>;
}

export const encodeTabs = ({
  tabList,
  activeFileId,
}: EditorTabsState): URLSearchParams => {
  const searchParams = new URLSearchParams();
  for (const tab of tabList) {
    let tabState = tab.isTransient ? 't' : 'p';
    // mark the active file
    if (tab.fileId === activeFileId) {
      tabState += 'a';
    }
    searchParams.set(tab.fileId, tabState);
  }
  return searchParams;
};

export const decodeTabs = (
  searchParams: URLSearchParams,
): EditorTabsState => {
  const tabList: TabState[] = [];
  let activeFileId = null;
  for (const [fileId, tabState] of Array.from(
    searchParams.entries(),
  )) {
    const isTransient = tabState.includes('t');
    const isActive = tabState.includes('a');
    if (isActive) {
      activeFileId = fileId;
    }
    tabList.push({ fileId, isTransient });
  }
  return { tabList, activeFileId };
};

export const useInitialTabs = (): EditorTabsState => {
  let [searchParams] = useSearchParams();

  return decodeTabs(searchParams);
};

export const usePersistTabs = ({
  activeFileId,
  tabList,
}: EditorTabsState) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(
      {
        search: encodeTabs({
          activeFileId,
          tabList,
        })
          .toString()
          .replace(/^\?$/, ''),
      },
      { replace: true },
    );
  }, [activeFileId, tabList]);
};
