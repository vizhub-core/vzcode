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

// The amount of time to wait idle before writing to localStorage.
// This is to avoid writing to localStorage on every resize event.
// MS = milliseconds
const localStorageWriteDebounceMS = 800;

const localStoragePropertyName = 'vizHubCodeEditorWidth';

const initialWidthDefault = 220;
let initialWidth: number = initialWidthDefault;

// If we're in the browser,
if (typeof window !== 'undefined') {
  //check localStorage for a previously stored width.
  const initialWidthFromLocalStorage: string | null =
    window.localStorage.getItem(localStoragePropertyName);

  // If there is a previously stored width,
  if (initialWidthFromLocalStorage !== null) {
    // use it as the initial width.
    initialWidth = +initialWidthFromLocalStorage;
  }
} else {
  // If we're not in the browser, use the default initial width.
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
