// From https://github.com/vizhub-core/vizhub/edit/main/vizhub-v2/packages/neoFrontend/src/pages/VizPage/SplitPaneResizeContext/index.js
import {
  createContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react';

export type Side = 'left' | 'right';

export type SplitPaneResizeContextValue = {
  codeEditorWidth: number;
  sidebarWidth: number;
  moveSplitPane: (a: number, side: Side) => void;
  isDraggingRight: boolean;
  isDraggingLeft: boolean;
  setIsDragging: (a: boolean, side: Side) => void;
  setSidebarView: (isAIChatOpen: boolean) => void;
};

// Default widths for different sidebar views
const filesViewWidth = 300;
const aiChatViewWidth = 600;
const initialCodeEditorWidthDefault = 800;

const initialValue: SplitPaneResizeContextValue = {
  codeEditorWidth: initialCodeEditorWidthDefault,
  sidebarWidth: filesViewWidth, // Default to files view
  moveSplitPane: () => {},
  isDraggingRight: false,
  isDraggingLeft: false,
  setIsDragging: () => {},
  setSidebarView: () => {},
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
  sidebarWidth: filesViewWidth,
  codeEditorWidth: initialCodeEditorWidthDefault,
  isDraggingLeft: false,
  isDraggingRight: false,
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
      type: 'setSidebarView';
      isAIChatOpen: boolean;
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
    case 'setSidebarView':
      return {
        ...state,
        sidebarWidth: action.isAIChatOpen
          ? aiChatViewWidth
          : filesViewWidth,
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

  const setSidebarView = useCallback(
    (isAIChatOpen: boolean) => {
      dispatch({ type: 'setSidebarView', isAIChatOpen });
    },
    [dispatch],
  );

  const {
    sidebarWidth,
    codeEditorWidth,
    isDraggingLeft,
    isDraggingRight,
  } = state;

  const value: SplitPaneResizeContextValue = {
    codeEditorWidth,
    sidebarWidth,
    moveSplitPane,
    isDraggingLeft,
    isDraggingRight,
    setIsDragging,
    setSidebarView,
  };

  return (
    <SplitPaneResizeContext.Provider value={value}>
      {children}
    </SplitPaneResizeContext.Provider>
  );
};
