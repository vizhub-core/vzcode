import { useRef } from 'react';
import { FileId, PaneId } from '../types';
import { EditorView } from 'codemirror';

export type EditorCacheValue = {
  editor: EditorView;
  themeCompartment: any;
  scrollPosition?: number;
};

export type EditorCacheKey = string;

export const editorCacheKey = (
  fileId: FileId,
  paneId: PaneId,
): EditorCacheKey => fileId + '|' + paneId;

export type EditorCache = Map<
  EditorCacheKey,
  EditorCacheValue
>;

export const useEditorCache = () => {
  // Singleton cache of CodeMirror instances
  // These are created, but never destroyed.
  // TODO consider invalidating this cache at some point.
  // Right now these editor instances just keep accumulating,
  // and they all retain their connections to ShareDB.
  // This has not been an issue so far, but it could become one.
  const editorCacheRef = useRef<EditorCache>(new Map());

  return editorCacheRef.current;
};
