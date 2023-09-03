// The split pane resizer component.
// This is what users drag to resize the split pane.
import {
  useContext,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import { SplitPaneResizeContext } from '../SplitPaneResizeContext';
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

export const Resizer = () => {
  const {
    codeEditorWidth,
    moveSplitPane,
    isDragging,
    setIsDragging,
  } = useContext(SplitPaneResizeContext);
  const previousClientX = useRef<number>(0);

  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      previousClientX.current = event.clientX;
      setIsDragging(true);
      document.body.style.cursor = 'col-resize';
    },
    [setIsDragging],
  );

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      const movementClientX =
        event.clientX - previousClientX.current;
      previousClientX.current = event.clientX;
      moveSplitPane(movementClientX);
    },
    [moveSplitPane],
  );

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = 'default';
  }, [setIsDragging]);

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

  return (
    <div
      className="vz-resizer"
      onMouseDown={onMouseDown}
      style={{
        left: codeEditorWidth - resizerWidth / 2,
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
