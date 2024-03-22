import {
  useRef,
  useLayoutEffect,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import { Username } from '../../types';
import { EditorCacheValue } from '../useEditorCache';
import { getOrCreateEditor } from './getOrCreateEditor';
import { VZCodeContext } from '../VZCodeContext';
import './style.scss';

// The path in the ShareDB document where the files live.
const filesPath = ['files'];

export const CodeEditor = () => {
  const {
    activeFileId,
    shareDBDoc,
    submitOperation,
    localPresence,
    docPresence,
    username,
    editorCache,
    editorWantsFocus,
    editorNoLongerWantsFocus,
    typeScriptWorker,
    theme,
  } = useContext(VZCodeContext);

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

  return <div className="vz-code-editor" ref={ref}></div>;
};
