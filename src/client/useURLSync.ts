import { useSearchParams } from 'react-router-dom';
import { FileId, VZCodeContent } from '../types';
import { useEffect, useRef } from 'react';

// Synchronizes the active pane state with the URL parameters.
export const useURLSync = ({
  content,
  setActiveFileId,
  activeFileId,
}: {
  content: VZCodeContent | null;
  setActiveFileId: (activeFileId: FileId) => void;
  activeFileId: FileId | null;
}) => {
  // Use React router to get and set the search parameters.
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

    // Get the active file id from the search parameters.
    const file = searchParams.get('file');
    if (file) {
      setActiveFileId(file as FileId);
    }

    // Mark the state as initialized.
    isInitialized.current = true;
  }, [content, searchParams, setActiveFileId, isInitialized]);

  // Track content in a ref so that we can use it in the
  // effect below without triggering the effect when
  // the content changes.
  const contentRef = useRef(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Track setSearchParams in a ref so that we can use it in the
  // effect below without triggering the effect on each render.
  const setSearchParamsRef = useRef(setSearchParams);
  useEffect(() => {
    setSearchParamsRef.current = setSearchParams;
  }, [setSearchParams]);

  // Update the URL to match the current state whenever
  // the active file changes.
  useEffect(() => {
    // Safety check to make sure the content is loaded.
    // Should never happen.
    if (!contentRef.current) {
      return;
    }

    // Update the URL if the active file has changed.
    setSearchParamsRef.current((oldSearchParams: URLSearchParams) => {
      // Create a copy of the old search params
      const updatedSearchParams = new URLSearchParams(oldSearchParams);

      // Set the 'file' parameter
      if (activeFileId) {
        updatedSearchParams.set('file', activeFileId);
      } else {
        updatedSearchParams.delete('file'); // Remove 'file' if there's no active file
      }

      // Return the updated search params
      return updatedSearchParams;
    });
  }, [activeFileId]);
};