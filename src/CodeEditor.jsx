import { useRef, useLayoutEffect } from 'react';
import { getOrCreateEditor } from './getOrCreateEditor';

export const CodeEditor = ({ activeFileId, shareDBDoc, localPresence }) => {
  const ref = useRef();

  // useEffect was buggy in that sometimes ref.current was undefined.
  // useLayoutEffect seems to solve that issue.
  useLayoutEffect(() => {
    const editor = getOrCreateEditor({
      fileId: activeFileId,
      shareDBDoc,
      localPresence,
    });
    ref.current.appendChild(editor.dom);

    return () => {
      ref.current.removeChild(editor.dom);
    };
  }, [shareDBDoc, activeFileId]);

  return <div className="editor" ref={ref} />;
};
