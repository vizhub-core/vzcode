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

const RESIZER_INTERACTION_WIDTH = 20;
const RESIZER_DRAGGING_WIDTH = 200;
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
  const previousClientX = useRef<number>(0);

  const shouldRenderResizer =
    side === 'left' || !!activePane.activeFileId;

  const isDragging =
    (side === 'left' && isDraggingLeft) ||
    (side === 'right' && isDraggingRight);

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
      const movementX = event.clientX - previousClientX.current;
      previousClientX.current = event.clientX;
      moveSplitPane(movementX, side);
    },
    [moveSplitPane, side],
  );

  const onMouseUp = useCallback(() => {
    setIsDragging(false, side);
    document.body.style.cursor = 'default';
  }, [setIsDragging, side]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [isDragging, onMouseMove, onMouseUp]);

  if (!shouldRenderResizer) return null;

  const resizerWidth = isDragging
    ? RESIZER_DRAGGING_WIDTH
    : RESIZER_INTERACTION_WIDTH;

  const leftPosition =
    (side === 'left'
      ? sidebarWidth
      : isSidebarVisible
      ? sidebarWidth + codeEditorWidth
      : codeEditorWidth) -
    resizerWidth / 2;

  return (
    <div
      className="vz-resizer"
      onMouseDown={onMouseDown}
      style={{
        left: leftPosition + resizerWidth / 2 - 1.5,
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
  );
};
