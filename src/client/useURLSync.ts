import { TabState } from '../types';
import { VizFileId, VizContent } from '@vizhub/viz-types';
import { useEffect, useMemo, useRef } from 'react';
import {
  TabStateParams,
  decodeTabs,
  encodeTabs,
} from './tabsSearchParameters';
import { useSearchParams } from '../reactRouterExports';

// Synchronizes the tab state with the URL parameters.
export const useURLSync = ({
  content,
  openTab,
  setActiveFileId,
  tabList,
  activeFileId,
}: {
  content: VizContent | null;
  openTab: (tabState: TabState) => void;
  setActiveFileId: (activeFileId: VizFileId) => void;
  tabList: Array<TabState>;
  activeFileId: VizFileId | null;
}) => {
  // Use React router to get and set the  search parameters.
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract the tab state parameters from the search parameters.
  const tabStateParams: TabStateParams = useMemo(
    () => ({
      file: searchParams.get('file'),
      tabs: searchParams.get('tabs'),
    }),
    [searchParams],
  );

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
      tabStateParams,
      content,
    });

    // Mark the state as initialized.
    isInitialized.current = true;

    // Update the state.
    tabList.forEach(openTab);
    setActiveFileId(activeFileId);
  }, [
    content,
    searchParams,
    setActiveFileId,
    openTab,
    isInitialized,
  ]);

  // Track content in a ref so that we can use it in the
  // effect below without triggering the effect when
  // the content changes.
  const contentRef = useRef(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // track setSearchParams in a ref so that we can use it in the
  // effect below without triggering the effect on each render.
  // The definition of `setSearchParams` changes on every render.
  const setSearchParamsRef = useRef(setSearchParams);
  useEffect(() => {
    setSearchParamsRef.current = setSearchParams;
  }, [setSearchParams]);

  // Update the URL to match the current state whenever
  // the active file or tab list changes.
  useEffect(() => {
    // Safety check to make sure the content is loaded.
    // Should never happen.
    if (!contentRef.current) {
      return;
    }

    const newTabStateParams: TabStateParams = encodeTabs({
      tabList,
      activeFileId,
      content: contentRef.current,
    });

    // Update the URL if the search parameters have changed.
    setSearchParamsRef.current(
      (oldSearchParams: URLSearchParams) => {
        // Create a copy of the old search params
        const updatedSearchParams = new URLSearchParams(
          oldSearchParams,
        );

        // Set the 'file' parameter
        if (newTabStateParams.file) {
          updatedSearchParams.set(
            'file',
            newTabStateParams.file,
          );
        } else {
          updatedSearchParams.delete('file'); // Remove 'file' if it's not present in newTabStateParams
        }

        // Set the 'tabs' parameter
        if (newTabStateParams.tabs) {
          updatedSearchParams.set(
            'tabs',
            newTabStateParams.tabs,
          );
        } else {
          updatedSearchParams.delete('tabs'); // Remove 'tabs' if it's not present in newTabStateParams
        }

        // Return the updated search params
        return updatedSearchParams;
      },
    );
  }, [tabList, activeFileId]);
};
