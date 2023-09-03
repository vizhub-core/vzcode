// From https://github.com/vizhub-core/vizhub/edit/main/vizhub-v2/packages/neoFrontend/src/pages/VizPage/SplitPaneResizeContext/index.js
import {
  useState,
  createContext,
  useReducer,
  useEffect,
} from 'react';

export const SplitPaneResizeContext = createContext<{
  codeEditorWidth: number;
  moveSplitPane: (a: number) => void;
  isDragging: boolean;
  setIsDragging: (a: boolean) => void;
}>(null);

const localStorageWriteDebounceMS = 800;

const localStoragePropertyName = 'vizHubCodeEditorWidth';

const initialWidthDefault = 220;
let initialWidth = initialWidthDefault;

if (typeof window !== 'undefined') {
  const initialWidthLocalStorage =
    +window.localStorage.getItem(localStoragePropertyName);
  initialWidth = initialWidthLocalStorage;
}

const add = (a: number, b: number) => a + b;

export const SplitPaneResizeProvider = ({ children }) => {
  const [codeEditorWidth, moveSplitPane] = useReducer(
    add,
    initialWidth,
  );
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (codeEditorWidth !== initialWidth) {
      const timeout = setTimeout(() => {
        window.localStorage.setItem(
          localStoragePropertyName,
          '' + codeEditorWidth,
        );
      }, localStorageWriteDebounceMS);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [codeEditorWidth]);

  return (
    <SplitPaneResizeContext.Provider
      value={{
        codeEditorWidth,
        moveSplitPane,
        isDragging,
        setIsDragging,
      }}
    >
      {children}
    </SplitPaneResizeContext.Provider>
  );
};
