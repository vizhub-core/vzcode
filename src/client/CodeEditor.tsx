import { useRef, useLayoutEffect } from 'react';
import { getOrCreateEditor } from './getOrCreateEditor';
import { FileId } from '../types';
import { themesByLabel } from './themes';

export const CodeEditor = ({
  activeFileId,
  shareDBDoc,
  localPresence,
  docPresence,
  theme,
}: {
  activeFileId: FileId;
  shareDBDoc: any;
  localPresence: any;
  docPresence: any;
  theme: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const editor = getOrCreateEditor({
      fileId: activeFileId,
      shareDBDoc,
      localPresence,
      docPresence,
      // TODO refactor this, make dynamic themes work
      theme: themesByLabel[theme],
    });
    ref.current.appendChild(editor.dom);

    return () => {
      ref.current.removeChild(editor.dom);
    };
  }, [shareDBDoc, activeFileId]);

  return <div className="editor" ref={ref} />;
};
