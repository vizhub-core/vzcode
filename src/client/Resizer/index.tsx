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

export const Resizer = () => {
  const { moveSplitPane, isDragging, setIsDragging } =
    useContext(SplitPaneResizeContext);
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

  return (
    <div className="vz-resizer" onMouseDown={onMouseDown}>
      <div className="vz-resizer-thumb" />
    </div>
  );
};
