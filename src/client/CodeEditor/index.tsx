import {
  useRef,
  useLayoutEffect,
  useCallback,
  useMemo,
  useEffect, // Added useEffect
} from 'react';
import {
  FileId,
  ShareDBDoc,
  Username,
  VZCodeContent,
} from '../../types';
import { ThemeLabel, defaultTheme } from '../themes';
import {
  EditorCache,
  EditorCacheValue,
} from '../useEditorCache';
import { getOrCreateEditor } from './getOrCreateEditor';
import './style.scss';

export const CodeEditor = ({
  activeFileId,
  shareDBDoc,
  submitOperation,
  localPresence,
  docPresence,
  theme = defaultTheme,
  filesPath = ['files'],
  editorCache,
  editorWantsFocus,
  editorNoLongerWantsFocus,
  username,
  typeScriptWorker,
}: {
  activeFileId: FileId;
  shareDBDoc: ShareDBDoc<VZCodeContent> | null;
  submitOperation: (
    next: (content: VZCodeContent) => VZCodeContent,
  ) => void;
  localPresence?: any;
  docPresence?: any;
  theme?: ThemeLabel;

  // The path of the files object in the ShareDB document.
  // Defaults to `files` if not provided.
  filesPath?: string[];
  editorCache: EditorCache;

  // Whether the editor should be focused.
  editorWantsFocus: boolean;

  // Signals that the editor no longer wants focus.
  editorNoLongerWantsFocus: () => void;
  username: Username;

  // The server endpoint for the AI Assist service.
  aiAssistEndpoint?: string;

  // Additional options to pass to the AI Assist service,
  // an object with string values.
  aiAssistOptions?: {
    [key: string]: string;
  };
  typeScriptWorker: Worker;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Set `doc.data.isInteracting` to `true` when the user is interacting
  // via interactive code widgets (e.g. Alt+drag), and `false` when they are not.
  const interactTimeoutRef = useRef(null);

  const onInteract = useCallback(() => {
    // Set `isInteracting: true` if not already set.
    if (!interactTimeoutRef.current) {
      submitOperation((document) => ({
        ...document,
        isInteracting: true,
      }));
    } else {
      clearTimeout(interactTimeoutRef.current);
    }

    // Set `isInteracting: undefined` after a delay.
    interactTimeoutRef.current = setTimeout(() => {
      interactTimeoutRef.current = null;

      // This logic deletes the `isInteracting` property from the document.
      submitOperation(
        ({ isInteracting, ...newDocument }) => newDocument,
      );
    }, 800);
  }, [submitOperation]);

  // Track username on a ref, so that we can use it in the
  // presence object's `username` property.
  const usernameRef = useRef<Username>(username);
  usernameRef.current = username;

  // Get the editor corresponding to the active file.
  // Looks in `editorCache` first, and if not found, creates a new editor.
  const editorCacheValue: EditorCacheValue = useMemo(
    () =>
      getOrCreateEditor({
        fileId: activeFileId,
        shareDBDoc,
        filesPath,
        localPresence,
        docPresence,
        theme,
        onInteract,
        editorCache,
        usernameRef,
        typeScriptWorker,
      }),
    [
      activeFileId,
      shareDBDoc,
      filesPath,
      localPresence,
      docPresence,
      theme,
      onInteract,
      editorCache,
      usernameRef,
      typeScriptWorker,
    ],
  );

  // Every time the active file switches from one file to another,
  // the editor corresponding to the old file is removed from the DOM,
  // and the editor corresponding to the new file is added to the DOM.
  useLayoutEffect(() => {
    // Guard against cases where page is still loading.
    if (!ref.current) return;
    if (!shareDBDoc) return;

    // Add the editor to the DOM.
    ref.current.appendChild(editorCacheValue.editor.dom);

    return () => {
      // Remove the old editor from the DOM.
      // This happens every time `activeFileId` changes.
      ref.current.removeChild(editorCacheValue.editor.dom);
    };
  }, [shareDBDoc, editorCacheValue]);

  // Focus the editor
  useLayoutEffect(() => {
    if (editorWantsFocus) {
      editorCacheValue.editor.focus();
      editorNoLongerWantsFocus();
    }
  }, [
    editorWantsFocus,
    editorCacheValue,
    editorNoLongerWantsFocus,
  ]);

  useEffect(() => { // Add useEffect for mounting and unmounting global event listeners
    const handleGlobalMouseMove = (e) => {
      if (!editorCacheValue?.view) return;

      const viewState = editorCacheValue.view.plugin(interactViewPlugin);
      if (!viewState?.dragging) return;

      const { rule, text } = viewState.target;
      const updateText = viewState.updateText(viewState.target);

      if (rule.onDrag) {
        rule.onDrag(text, updateText, e);
      }
    };

    const handleGlobalMouseUp = (e) => {
      if (!editorCacheValue?.view) return;

      const viewState = editorCacheValue.view.plugin(interactViewPlugin);
      if (viewState) {
        viewState.endDrag();
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [editorCacheValue]);

  return <div className="vz-code-editor" ref={ref}></div>;
};
