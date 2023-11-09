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

// Feature flag
const enableLocalStorage = false;

// If we're in the browser,
if (typeof window !== 'undefined' && enableLocalStorage) {
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
  moveSplitPane: (
    a: number,
    side: 'left' | 'right',
  ) => void;
  isDraggingRight: boolean;
  isDraggingLeft: boolean;
  setIsDragging: (
    a: boolean,
    side: 'left' | 'right',
  ) => void;
};

const initialValue: SplitPaneResizeContextValue = {
  codeEditorWidth: initialCodeEditorWidth,
  sidebarWidth: initialSidebarWidth,
  moveSplitPane: () => {},
  isDraggingRight: false,
  isDraggingLeft: false,
  setIsDragging: () => {},
};

export const SplitPaneResizeContext =
  createContext<SplitPaneResizeContextValue>(initialValue);

type SplitPaneState = {
  // The width of the sidebar, in pixels.
  sidebarWidth: number;
  codeEditorWidth: number;
  isDraggingLeft: boolean;
  isDraggingRight: boolean;
};

const initialState: SplitPaneState = {
  sidebarWidth: initialSidebarWidth,
  codeEditorWidth: initialCodeEditorWidth,
  isDraggingLeft: false,
  isDraggingRight: false,
};

type SplitPaneAction =
  | {
      type: 'move';
      side: 'left' | 'right';
      movementX: number;
    }
  | {
      type: 'setIsDragging';
      side: 'left' | 'right';
      isDragging: boolean;
    };

const splitPaneReducer = (
  state: SplitPaneState,
  action: SplitPaneAction,
) => {
  switch (action.type) {
    case 'move':
      return action.side === 'left'
        ? {
            ...state,
            sidebarWidth:
              state.sidebarWidth + action.movementX,
          }
        : {
            ...state,
            codeEditorWidth:
              state.codeEditorWidth + action.movementX,
          };
    // Handle setIsDragging
    case 'setIsDragging':
      return action.side === 'left'
        ? {
            ...state,
            isDraggingLeft: action.isDragging,
          }
        : {
            ...state,
            isDraggingRight: action.isDragging,
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

  const setIsDragging = useCallback(
    (isDragging: boolean, side: 'left' | 'right') => {
      dispatch({ type: 'setIsDragging', isDragging, side });
    },
    [dispatch],
  );

  const moveSplitPane = useCallback(
    (movementX: number, side: 'left' | 'right') => {
      dispatch({ type: 'move', movementX, side });
    },
    [dispatch],
  );

  const {
    sidebarWidth,
    codeEditorWidth,
    isDraggingLeft,
    isDraggingRight,
  } = state;

  // Logic around storing the values in localStorage.
  useEffect(() => {
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

  const value: SplitPaneResizeContextValue = {
    codeEditorWidth,
    sidebarWidth,
    moveSplitPane,
    isDraggingLeft,
    isDraggingRight,
    setIsDragging,
  };

  return (
    <SplitPaneResizeContext.Provider value={value}>
      {children}
    </SplitPaneResizeContext.Provider>
  );
};
