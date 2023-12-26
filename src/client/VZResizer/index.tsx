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
    [side === 'right'
      ? 'rightPanelWidth'
      : 'leftPanelWidth']: panelWidth,
    moveSplitPane,
    isDraggingRight,
    isDraggingLeft,
    setIsDragging,
  } = useContext(SplitPaneResizeContext);

  const previousClientX = useRef<number>(0);
  const pointerId = useRef<number>(null);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      previousClientX.current = event.clientX;
      pointerId.current = event.pointerId;
      setIsDragging(true, side);
      document.body.style.cursor = 'col-resize';
    },
    [setIsDragging, side],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (pointerId.current !== event.pointerId) {
        return;
      }
      event.preventDefault();
      const movementX =
        event.clientX - previousClientX.current;
      previousClientX.current = event.clientX;
      moveSplitPane(movementX, side);
    },
    [moveSplitPane, side],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent) => {
      if (pointerId.current !== event.pointerId) {
        return;
      }
      pointerId.current = null;
      setIsDragging(false, side);
      document.body.style.cursor = 'default';
    },
    [setIsDragging, side],
  );

  // Is the resizer currently being dragged?
  const isDragging =
    (side === 'left' && isDraggingLeft) ||
    (side === 'right' && isDraggingRight);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener(
        'pointermove',
        onPointerMove,
      );
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener(
        'pointercancel',
        onPointerUp,
      );
      return () => {
        document.removeEventListener(
          'pointermove',
          onPointerMove,
        );
        document.removeEventListener(
          'pointerup',
          onPointerUp,
        );
      };
    }
  }, [isDragging, onPointerMove, onPointerUp]);

  const resizerWidth = isDragging
    ? resizerInteractionSurfaceWidthWhileDragging
    : resizerInteractionSurfaceWidth;

  return (
    <div
      className="vz-resizer"
      onPointerDown={onPointerDown}
      style={{
        [side]: panelWidth - resizerWidth / 2,
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
  );
};
