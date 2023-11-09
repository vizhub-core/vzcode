// From https://github.com/vizhub-core/vizhub/edit/main/vizhub-v2/packages/neoFrontend/src/pages/VizPage/SplitPaneResizeContext/index.js
import {
  useState,
  createContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';

// The amount of time to wait idle before writing to localStorage.
// This is to avoid writing to localStorage on every resize event.
// MS = milliseconds
const localStorageWriteDebounceMS = 800;

// Properties in LocalStorage
const sidebarWidthProperty = 'vzCodeSidebarWidth';
const codeEditorWidthProperty = 'vzCodeCodeEditorWidth';

const initialSidebarWidthDefault = 220;
let initialSidebarWidth: number =
  initialSidebarWidthDefault;

const initialCodeEditorWidthDefault = 500;
let initialCodeEditorWidth: number =
  initialCodeEditorWidthDefault;

// If we're in the browser,
if (typeof window !== 'undefined') {
  //check localStorage for a previously stored width.
  const sidebarWidthLocal: string | null =
    window.localStorage.getItem(sidebarWidthProperty);

  const codeEditorWidthLocal: string | null =
    window.localStorage.getItem(codeEditorWidthProperty);

  // If there is a previously stored width,
  if (sidebarWidthLocal !== null) {
    // use it as the initial width.
    initialSidebarWidth = +sidebarWidthLocal;
  }

  if (codeEditorWidthLocal !== null) {
    // use it as the initial width.
    initialCodeEditorWidth = +codeEditorWidthLocal;
  }
} else {
  // If we're not in the browser, use the default initial width.
}

type SplitPaneResizeContextValue = {
  codeEditorWidth: number;
  sidebarWidth: number;
  moveSplitPane: (a: number) => void;
  isDragging: boolean;
  setIsDragging: (a: boolean) => void;
};

const initialValue: SplitPaneResizeContextValue = {
  codeEditorWidth: initialCodeEditorWidth,
  sidebarWidth: initialSidebarWidth,
  moveSplitPane: () => {},
  isDragging: false,
  setIsDragging: () => {},
};

export const SplitPaneResizeContext =
  createContext<SplitPaneResizeContextValue>(initialValue);

type SplitPaneState = {
  // The width of the sidebar, in pixels.
  sidebarWidth: number;
  codeEditorWidth: number;
  isDragging: boolean;
};

const add = (a: number, b: number) => a + b;

const initialState: SplitPaneState = {
  sidebarWidth: initialSidebarWidth,
  codeEditorWidth: initialCodeEditorWidth,
  isDragging: false,
};

type SplitPaneAction =
  | {
      type: 'move';
      movementX: number;
    }
  | {
      type: 'setIsDragging';
      isDragging: boolean;
    };

const splitPaneReducer = (
  state: SplitPaneState,
  action: SplitPaneAction,
) => {
  switch (action.type) {
    case 'move':
      return {
        ...state,
        sidebarWidth: state.sidebarWidth + action.movementX,
      };
    // Handle setIsDragging
    case 'setIsDragging':
      return {
        ...state,
        isDragging: action.isDragging,
      };
    default:
      return state;
  }
};

export const SplitPaneResizeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    splitPaneReducer,
    initialState,
  );
  // const [isDragging, setIsDragging] = useState(false);

  const setIsDragging = useCallback(
    (isDragging: boolean) => {
      dispatch({ type: 'setIsDragging', isDragging });
    },
    [dispatch],
  );

  const moveSplitPane = useCallback(
    (movementX: number) => {
      dispatch({ type: 'move', movementX });
    },
    [dispatch],
  );

  const { sidebarWidth, codeEditorWidth, isDragging } =
    state;

  // Logic around storing the values in localStorage.
  useEffect(() => {
    // TODO use this pattern
    // if (codeEditorWidth !== initialWidth) {
    //   const timeout = setTimeout(() => {
    //     window.localStorage.setItem(
    //       localStoragePropertyName,
    //       '' + codeEditorWidth,
    //     );
    //   }, localStorageWriteDebounceMS);

    //   return () => {
    //     clearTimeout(timeout);
    //   };
    // }

    if (sidebarWidth !== initialSidebarWidth) {
      setTimeout(() => {
        window.localStorage.setItem(
          sidebarWidthProperty,
          '' + sidebarWidth,
        );
      }, localStorageWriteDebounceMS);
    }

    if (codeEditorWidth !== initialCodeEditorWidth) {
      setTimeout(() => {
        window.localStorage.setItem(
          codeEditorWidthProperty,
          '' + codeEditorWidth,
        );
      }, localStorageWriteDebounceMS);
    }
  }, [codeEditorWidth, sidebarWidth]);

  const value = {
    codeEditorWidth,
    sidebarWidth,
    moveSplitPane,
    isDragging,
    setIsDragging,
  };

  return (
    <SplitPaneResizeContext.Provider value={value}>
      {children}
    </SplitPaneResizeContext.Provider>
  );
};
