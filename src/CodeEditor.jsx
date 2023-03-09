import { useRef, useLayoutEffect } from 'react';
import { getOrCreateEditor } from './getOrCreateEditor';

export const CodeEditor = ({
  activeFileId,
  shareDBDoc,
  localPresence,
  docPresence,
}) => {
  const ref = useRef();

  // useEffect was buggy in that sometimes ref.current was undefined.
  // useLayoutEffect seems to solve that issue.
  useLayoutEffect(() => {
    const editor = getOrCreateEditor({
      fileId: activeFileId,
      shareDBDoc,
      localPresence,
      docPresence,
    });
    ref.current.appendChild(editor.dom);

    return () => {
      ref.current.removeChild(editor.dom);
    };
  }, [shareDBDoc, activeFileId]);

  return <div className="editor" ref={ref} />;
};
