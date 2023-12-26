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
  rightPanelWidth: number;
  leftPanelWidth: number;
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
const leftPanelWidthProperty = 'vzCodeLeftPanelWidth';
const rightPanelWidthProperty = 'vzCodeRightPanelWidth';

const initialLeftPanelWidthDefault = 220;
let initialLeftPanelWidth: number =
  initialLeftPanelWidthDefault;

const initialRightPanelWidthDefault = 800;
let initialRightPanelWidth: number =
  initialRightPanelWidthDefault;

// If no value is found in localStorage, we'll use the default.
let needsInitialization = false;

// If we're in the browser,
if (typeof window !== 'undefined' && enableLocalStorage) {
  //check localStorage for a previously stored width.
  const leftPanelWidthLocal: string | null =
    window.localStorage.getItem(leftPanelWidthProperty);

  const rightPanelWidthLocal: string | null =
    window.localStorage.getItem(rightPanelWidthProperty);

  // If there is a previously stored width,
  if (leftPanelWidthLocal !== null) {
    // use it as the initial width.
    initialLeftPanelWidth = +leftPanelWidthLocal;
    needsInitialization = true;
  }

  if (rightPanelWidthLocal !== null) {
    // use it as the initial width.
    initialRightPanelWidth = +rightPanelWidthLocal;
    needsInitialization = true;
  }
} else {
  // If we're not in the browser, use the default initial width.
}

const initialValue: SplitPaneResizeContextValue = {
  rightPanelWidth: initialRightPanelWidth,
  leftPanelWidth: initialLeftPanelWidth,
  moveSplitPane: () => {},
  isDraggingRight: false,
  isDraggingLeft: false,
  setIsDragging: () => {},
};

export const SplitPaneResizeContext =
  createContext<SplitPaneResizeContextValue>(initialValue);

type SplitPaneState = {
  // The width of the sidebar, in pixels.
  leftPanelWidth: number;
  rightPanelWidth: number;
  isDraggingLeft: boolean;
  isDraggingRight: boolean;

  // False on first render
  isInitialized: boolean;
  // whether the last change to the state was performed manually by the user
  // false in case of wimdow resizes
  manual: boolean;
};

const initialState: SplitPaneState = {
  // leftPanelWidth: initialLeftPanelWidth,
  // rightPanelWidth: initialRightPanelWidth,

  // These need to match between SSR and the first
  // client-side render (hydration), to avoid
  // React hydration errors like this one:
  //  * Warning: Prop `style` did not match.
  //  * Server: "left:210px;width:20px"
  //  * Client: "left:218px;width:20px"

  leftPanelWidth: initialLeftPanelWidthDefault,
  rightPanelWidth: initialRightPanelWidthDefault,
  isDraggingLeft: false,
  isDraggingRight: false,

  // Solution for hydration errors: we set the value from localStorage
  // in a layoutEffect that happens after first render.
  isInitialized: false,
  manual: false,
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
    }
  | {
      type: 'resize';
    };

const clamp = (width: number) => {
  return Math.max(
    10,
    Math.min(window.innerWidth - 10, width),
  );
};

const splitPaneReducer = (
  state: SplitPaneState,
  action: SplitPaneAction,
) => {
  switch (action.type) {
    case 'initialize':
      return {
        ...state,
        leftPanelWidth: initialLeftPanelWidth,
        rightPanelWidth: initialRightPanelWidth,
        isInitialized: true,
      };
    case 'resize':
      if (
        state.leftPanelWidth > window.innerWidth - 10 ||
        state.rightPanelWidth > window.innerWidth - 10
      ) {
        return {
          ...state,
          manual: false,
          leftPanelWidth: clamp(state.leftPanelWidth),
          rightPanelWidth: clamp(state.rightPanelWidth),
        };
      } else {
        return state;
      }
    case 'move':
      return action.side === 'left'
        ? {
            ...state,
            manual: true,
            leftPanelWidth: clamp(
              state.leftPanelWidth + action.movementX,
            ),
          }
        : {
            ...state,
            manual: true,
            rightPanelWidth: clamp(
              state.rightPanelWidth - action.movementX,
            ),
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
      dispatch({
        type: 'move',
        movementX,
        side,
      });
    },
    [dispatch],
  );

  const {
    leftPanelWidth,
    rightPanelWidth,
    isDraggingLeft,
    isDraggingRight,
    isInitialized,
    manual,
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
    if (!manual) {
      // avpid changing local storage for chamges that were caused by resizing
      // the window rather than dragging the resizers
      return;
    }
    if (leftPanelWidth !== initialLeftPanelWidth) {
      setTimeout(() => {
        window.localStorage.setItem(
          leftPanelWidthProperty,
          '' + leftPanelWidth,
        );
      }, localStorageWriteDebounceMS);
    }

    if (rightPanelWidth !== initialRightPanelWidth) {
      setTimeout(() => {
        window.localStorage.setItem(
          rightPanelWidthProperty,
          '' + rightPanelWidth,
        );
      }, localStorageWriteDebounceMS);
    }
  }, [manual, rightPanelWidth, leftPanelWidth]);

  // handle window resizes
  useEffect(() => {
    const handler = () => dispatch({ type: 'resize' });
    handler();
    window.addEventListener('resize', handler);
    return () =>
      window.removeEventListener('resize', handler);
  }, []);

  const value: SplitPaneResizeContextValue = {
    rightPanelWidth,
    leftPanelWidth,
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
