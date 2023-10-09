import { useRef, useLayoutEffect } from 'react';
import { FileId } from '../../types';
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
  localPresence,
  docPresence,
  theme = defaultTheme,
  filesPath = ['files'],
  onInteract,
  editorCache,
}: {
  activeFileId: FileId;
  shareDBDoc: any;
  localPresence?: any;
  docPresence?: any;
  theme?: ThemeLabel;

  // The path of the files object in the ShareDB document.
  // Defaults to `files` if not provided.
  filesPath?: string[];
  onInteract?: () => void;
  editorCache: EditorCache;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Every time the active file switches from one file to another,
  // the editor corresponding to the old file is removed from the DOM,
  // and the editor corresponding to the new file is added to the DOM.

  useLayoutEffect(() => {
    // Guard against cases where page is still loading.
    if (!ref.current) return;
    if (!shareDBDoc) return;

    // Get the editor corresponding to the active file.
    // Looks in `editorCache` first, and if not found, creates a new editor.
    const editorCacheValue: EditorCacheValue =
      getOrCreateEditor({
        fileId: activeFileId,
        shareDBDoc,
        filesPath,
        localPresence,
        docPresence,
        theme,
        onInteract,
        editorCache,
      });

    // Add the editor to the DOM.
    ref.current.appendChild(editorCacheValue.editor.dom);

    return () => {
      // Remove the old editor from the DOM.
      // This happens every time `activeFileId` changes.
      ref.current.removeChild(editorCacheValue.editor.dom);
    };
  }, [shareDBDoc, activeFileId]);

  return(
  <div className="vz-code-editor" ref={ref}>
  {/* Overlay div */}
    <div className="overlay-div">
      <h2>Overlay Content</h2>
      <p>This is some example overlay content on top of the editor.</p>
      <button onClick={() => alert('Button Clicked!')}>Click Me</button>
    </div>
  </div>); 
};
