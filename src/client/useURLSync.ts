import { useSearchParams } from 'react-router-dom';
import { FileId, VZCodeContent } from '../types';
import { TabState } from './vzReducer';
import { useEffect, useRef } from 'react';
import {
  decodeTabs,
  encodeTabs,
} from './tabsSearchParameters';

// Synchronizes the tab state with the URL parameters.
export const useURLSync = ({
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
  // initial search parameters from the URL.
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
    const { tabList, activeFileId } = decodeTabs({
      searchParams,
      content,
    });

    // Mark the state as initialized.
    isInitialized.current = true;

    // Update the state.
    setActiveFileId(activeFileId);
    tabList.forEach(openTab);
  }, [
    content,
    searchParams,
    setActiveFileId,
    openTab,
    isInitialized,
  ]);

  // Update the URL to match the current state whenever
  // the active file or tab list changes.
  useEffect(() => {
    if (!content) {
      return;
    }

    const newSearchParams = encodeTabs({
      tabList,
      activeFileId,
      content,
    });

    console.log(
      'newSearchParams',
      newSearchParams.toString(),
    );

    // Update the URL if the search parameters have changed.
    setSearchParams((oldSearchParams) => {
      return { foo: 'bar' };
    });
  }, [searchParams, content, tabList, activeFileId]);
};
