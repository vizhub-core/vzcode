import {
  useContext,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  Side,
  SplitPaneResizeContext,
} from '../SplitPaneResizeContext';
import { VZCodeContext } from '../VZCodeContext';
import './styles.scss';

const RESIZER_INTERACTION_SURFACE_WIDTH = 20;
const RESIZER_INTERACTION_SURFACE_WIDTH_WHILE_DRAGGING = 200;
const RESIZER_THUMB_WIDTH = 4;

export const VZResizer = ({
  side,
  isSidebarVisible = true,
}: {
  side: Side;
  isSidebarVisible?: boolean;
}) => {
  const {
    sidebarWidth,
    codeEditorWidth,
    moveSplitPane,
    isDraggingRight,
    isDraggingLeft,
    setIsDragging,
  } = useContext(SplitPaneResizeContext);

  const { activePane } = useContext(VZCodeContext);

  // Ref to track previous mouse X position
  const previousClientX = useRef<number>(0);

  // Determine if the resizer should render
  const shouldRenderResizer =
    side === 'left' || !!activePane.activeFileId;

  // Is the resizer being dragged?
  const isDragging =
    (side === 'left' && isDraggingLeft) ||
    (side === 'right' && isDraggingRight);

  // Handle mouse down to start dragging
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      previousClientX.current = event.clientX;
      setIsDragging(true, side);
      document.body.style.cursor = 'col-resize';
    },
    [setIsDragging, side],
  );

  // Handle mouse movement during dragging
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      const movementX = event.clientX - previousClientX.current;
      previousClientX.current = event.clientX;
      moveSplitPane(movementX, side);
    },
    [moveSplitPane, side],
  );

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false, side);
    document.body.style.cursor = 'default';
  }, [setIsDragging, side]);

  // Add/remove event listeners based on dragging state
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Dynamic resizer width
  const resizerWidth = isDragging
    ? RESIZER_INTERACTION_SURFACE_WIDTH_WHILE_DRAGGING
    : RESIZER_INTERACTION_SURFACE_WIDTH;

  // Calculate the resizer position
  const calculateLeft = (): number => {
    const baseLeft =
      side === 'left'
        ? sidebarWidth
        : isSidebarVisible
        ? sidebarWidth + codeEditorWidth
        : codeEditorWidth;

    return baseLeft - resizerWidth / 2;
  };

  const left = calculateLeft();

  // Render the resizer component if applicable
  return shouldRenderResizer ? (
    <div
      className="vz-resizer"
      onMouseDown={handleMouseDown}
      style={{
        left: left + resizerWidth / 2 - 1.5,
        width: resizerWidth,
      }}
    >
      <div
        className="vz-resizer-thumb"
        style={{
          left: RESIZER_THUMB_WIDTH / 2 - 1.5,
          width: RESIZER_THUMB_WIDTH,
        }}
      />
    </div>
  ) : null;
};
