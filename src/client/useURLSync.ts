import { useSearchParams } from 'react-router-dom';
import { FileId, VZCodeContent } from '../types';
import { TabState } from './vzReducer';
import { useEffect, useMemo, useRef } from 'react';
import {
  TabStateParams,
  decodeTabs,
  encodeTabs,
} from './tabsSearchParameters';

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
  const [searchParams, setSearchParams] = useSearchParams();

  const tabStateParams: TabStateParams = useMemo(
    () => ({
      file: searchParams.get('file'),
      tabs: searchParams.get('tabs'),
    }),
    [searchParams]
  );

  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) {
      return;
    }

    if (!content) {
      return;
    }

    const { tabList, activeFileId } = decodeTabs({
      tabStateParams,
      content,
    });

    isInitialized.current = true;

    setActiveFileId(activeFileId);
    tabList.forEach(openTab);
  }, [
    content,
    searchParams,
    setActiveFileId,
    openTab,
    isInitialized,
  ]);

  const contentRef = useRef(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const setSearchParamsRef = useRef(setSearchParams);
  useEffect(() => {
    setSearchParamsRef.current = setSearchParams;
  }, [setSearchParams]);

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    const newTabStateParams: TabStateParams = encodeTabs({
      tabList,
      activeFileId,
      content: contentRef.current,
    });

    setSearchParamsRef.current((oldSearchParams: URLSearchParams) => {
      const updatedSearchParams = new URLSearchParams(oldSearchParams);

      if (newTabStateParams.file) {
        updatedSearchParams.set('file', newTabStateParams.file);
      } else {
        updatedSearchParams.delete('file');
      }

      if (newTabStateParams.tabs) {
        updatedSearchParams.set('tabs', newTabStateParams.tabs);
      } else {
        updatedSearchParams.delete('tabs');
      }

      return updatedSearchParams;
    });
  }, [tabList, activeFileId]);

  useEffect(() => {
    const handlePopstate = () => {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const fileParam = urlSearchParams.get('file');
      const tabsParam = urlSearchParams.get('tabs');

      const { tabList, activeFileId } = decodeTabs({
        tabStateParams: { file: fileParam, tabs: tabsParam },
        content: contentRef.current,
      });

      setActiveFileId(activeFileId);
      tabList.forEach(openTab);
    };

    // Call handlePopstate initially to ensure correct tab state on page load.
    handlePopstate();

    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [setActiveFileId, openTab]);
};
