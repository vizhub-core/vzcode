import { useSearchParams } from 'react-router-dom';
import { FileId, VZCodeContent } from '../types';
import { TabState } from './vzReducer';
import { useEffect, useRef } from 'react';
import { decodeTabs } from './tabsSearchParameters';

export const useSyncURLParams = ({
  content,
  openTab,
  setActiveFileId,
  tabList,
  activeFileId,
}: {
  content: VZCodeContent | null;
  openTab: (tabState: TabState) => void;
  setActiveFileId: (activeFileId: FileId) => void;
  tabList: Array<TabState>;
  activeFileId: FileId | null;
}) => {
  // Use React router to get and set the  search parameters.
  const [searchParams, setSearchParams] = useSearchParams();

  // `true` after the state is updated based on the
  // initial search parameters.
  const isInitialized = useRef(false);

  // Initialize the state based on the search parameters.
  useEffect(() => {
    // Do nothing if the state has already been initialized.
    if (isInitialized.current) {
      return;
    }

    // Wait for the content to be loaded.
    if (!content) {
      return;
    }

    // Decode the search parameters.
    const { tabList, activeFileId } = decodeTabs(
      searchParams,
      content,
    );
  }, [
    content,
    searchParams,
    setActiveFileId,
    openTab,
    isInitialized,
  ]);

  // If the current state has a different set of tabs than the URL,
  // update the URL to match the current state.
  useEffect(() => {
    if (!content) {
      return;
    }
    if (tabList.length !== urlTabList.length) {
      // TODO handle this case
      console.log('TODO handle this case');
      return;
    }
    // TODO handle the case where the tab list is the same, but the
    // active tab is different.
    if (activeFileId !== urlActiveFileId) {
      const searchParams = encodeTabs({
        tabList,
        activeFileId,
      });
      navigate({ search: searchParams.toString() });
    }
  }, [
    content,
    tabList,
    urlTabList,
    activeFileId,
    urlActiveFileId,
    navigate,
  ]);

  // If the URL has a tab that is not in the current state, open it.
  useEffect(() => {
    if (!content) {
      return;
    }
    for (const tab of urlTabList) {
      if (!tabList.some((t) => t.fileId === tab.fileId)) {
        openTab(tab);
      }
    }
  }, [content, urlTabList, tabList, openTab]);

  // If the URL has a tab that is not in the current state, open it.
  useEffect(() => {
    if (!content) {
      return;
    }
    for (const tab of urlTabList) {
      if (!tabList.some((t) => t.fileId === tab.fileId)) {
        openTab(tab);
      }
    }
  }, [content, urlTabList, tabList, openTab]);

  // If the URL has a tab that is not in the current state, open it.
  useEffect(() => {
    if (!content) {
      return;
    }
    for (const tab of urlTabList) {
      if (!tabList.some((t) => t.fileId === tab.fileId)) {
        openTab(tab);
      }
    }
  }, [content, urlTabList, tabList, openTab]);
};
