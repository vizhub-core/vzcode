import { useRef, useLayoutEffect } from 'react';
import { FileId } from '../../types';
import { defaultTheme, themesByLabel } from '../themes';
import { getOrCreateEditor } from './getOrCreateEditor';
import './style.scss';
import { EditorCache } from '../useEditorCache';

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
  theme?: string;

  // The path of the files object in the ShareDB document.
  // Defaults to the root of the document.
  filesPath?: string[];
  onInteract?: () => void;
  editorCache: EditorCache;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    if (!shareDBDoc) return;

    // `getOrCreateEditor` gets called
    // every time the active file changes.
    const editor = getOrCreateEditor({
      fileId: activeFileId,
      shareDBDoc,
      filesPath,
      localPresence,
      docPresence,
      // TODO refactor this, make dynamic themes work
      theme: themesByLabel[theme],
      onInteract,
      editorCache,
    });
    ref.current.appendChild(editor.dom);

    return () => {
      ref.current.removeChild(editor.dom);
    };
  }, [shareDBDoc, activeFileId]);

  return <div className="vz-code-editor" ref={ref} />;
};
