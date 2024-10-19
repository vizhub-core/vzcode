// From https://github.com/vizhub-core/vizhub/edit/main/vizhub-v2/packages/neoFrontend/src/pages/VizPage/SplitPaneResizeContext/index.js
import {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';

export type Side = 'left' | 'right';

export type SplitPaneResizeContextValue = {
  codeEditorWidth: number;
  sidebarWidth: number;
  moveSplitPane: (a: number, side: Side) => void;
  isDraggingRight: boolean;
  isDraggingLeft: boolean;
  setIsDragging: (a: boolean, side: Side) => void;
};

// Feature flag for developers to use when testing.
const enableLocalStorage = true;

// The amount of time to wait idle before writing to localStorage.
// This is to avoid writing to localStorage on every resize event.
// MS = milliseconds
const localStorageWriteDebounceMS = 800;

// Properties in LocalStorage
const sidebarWidthProperty = 'vzCodeSidebarWidth';
const codeEditorWidthProperty = 'vzCodeCodeEditorWidth';

const initialSidebarWidthDefault = 250;
let initialSidebarWidth: number =
  initialSidebarWidthDefault;

const initialCodeEditorWidthDefault = 800;
let initialCodeEditorWidth: number =
  initialCodeEditorWidthDefault;

// If no value is found in localStorage, we'll use the default.
let needsInitialization = false;

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
    needsInitialization = true;
  }

  if (codeEditorWidthLocal !== null) {
    // use it as the initial width.
    initialCodeEditorWidth = +codeEditorWidthLocal;
    needsInitialization = true;
  }
} else {
  // If we're not in the browser, use the default initial width.
}

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

  // False on first render
  isInitialized: boolean;
};

const initialState: SplitPaneState = {
  // sidebarWidth: initialSidebarWidth,
  // codeEditorWidth: initialCodeEditorWidth,

  // These need to match between SSR and the first
  // client-side render (hydration), to avoid
  // React hydration errors like this one:
  //  * Warning: Prop `style` did not match.
  //  * Server: "left:210px;width:20px"
  //  * Client: "left:218px;width:20px"

  sidebarWidth: initialSidebarWidthDefault,
  codeEditorWidth: initialCodeEditorWidthDefault,
  isDraggingLeft: false,
  isDraggingRight: false,

  // Solution for hydration errors: we set the value from localStorage
  // in a layoutEffect that happens after first render.
  isInitialized: false,
};

type SplitPaneAction =
  | {
      type: 'move';
      side: Side;
      movementX: number;
    }
  | {
      type: 'setIsDragging';
      side: Side;
      isDragging: boolean;
    }
  | {
      type: 'initialize';
    };

const splitPaneReducer = (
  state: SplitPaneState,
  action: SplitPaneAction,
) => {
  switch (action.type) {
    case 'initialize':
      return {
        ...state,
        sidebarWidth: initialSidebarWidth,
        codeEditorWidth: initialCodeEditorWidth,
        isInitialized: true,
      };
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
    (isDragging: boolean, side: Side) => {
      dispatch({ type: 'setIsDragging', isDragging, side });
    },
    [dispatch],
  );

  const moveSplitPane = useCallback(
    (movementX: number, side: Side) => {
      dispatch({ type: 'move', movementX, side });
    },
    [dispatch],
  );

  const {
    sidebarWidth,
    codeEditorWidth,
    isDraggingLeft,
    isDraggingRight,
    isInitialized,
  } = state;

  // Logic around initializing from localStorage.
  // Only run this on the client.
  if (typeof window !== 'undefined') {
    useLayoutEffect(() => {
      if (needsInitialization && !isInitialized) {
        dispatch({ type: 'initialize' });
      }
    }, [isInitialized]);
  }

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
