// The split pane resizer component.
// This is what users drag to resize the split pane.
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

// This is the width of the resizer interaction surface.
// On this surface, the cursor changes to a resize cursor.
const resizerInteractionSurfaceWidth = 20;

// Expand while dragging to make it easier to hit.
// Without this, various sidebar elements get hovered on and change style.
const resizerInteractionSurfaceWidthWhileDragging = 200;

// This is the width of the resizer visible area.
// This is the part of the resizer that is visible to the user.
const resizerThumbWidth = 4;

export const VZResizer = ({ side }: { side: Side }) => {
  const {
    sidebarWidth,
    codeEditorWidth,
    moveSplitPane,
    isDraggingRight,
    isDraggingLeft,
    setIsDragging,
  } = useContext(SplitPaneResizeContext);

  // If there is no active file, don't render the resizer
  // for the right side.
  const { activeFileId } = useContext(VZCodeContext);
  const shouldRenderResizer =
    side === 'left' || activeFileId;

  const previousClientX = useRef<number>(0);

  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      previousClientX.current = event.clientX;
      setIsDragging(true, side);
      document.body.style.cursor = 'col-resize';
    },
    [setIsDragging, side],
  );

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      const movementX =
        event.clientX - previousClientX.current;
      previousClientX.current = event.clientX;
      moveSplitPane(movementX, side);
    },
    [moveSplitPane, side],
  );

  const onMouseUp = useCallback(() => {
    setIsDragging(false, side);
    document.body.style.cursor = 'default';
  }, [setIsDragging, side]);

  // Is the resizer currently being dragged?
  const isDragging =
    (side === 'left' && isDraggingLeft) ||
    (side === 'right' && isDraggingRight);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      return () => {
        document.removeEventListener(
          'mousemove',
          onMouseMove,
        );
        document.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [isDragging, onMouseMove, onMouseUp]);

  const resizerWidth = isDragging
    ? resizerInteractionSurfaceWidthWhileDragging
    : resizerInteractionSurfaceWidth;

  const left =
    (side === 'left'
      ? sidebarWidth
      : sidebarWidth + codeEditorWidth) -
    resizerWidth / 2;

  return shouldRenderResizer ? (
    <div
      className="vz-resizer"
      onMouseDown={onMouseDown}
      style={{
        left,
        width: resizerWidth,
      }}
    >
      <div
        className="vz-resizer-thumb"
        style={{
          left: resizerWidth / 2 - resizerThumbWidth / 2,
          width: resizerThumbWidth,
        }}
      />
    </div>
  ) : null;
};
