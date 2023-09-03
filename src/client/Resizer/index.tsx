// The split pane resizer component.
// This is what users drag to resize the split pane.
import {
  useContext,
  useEffect,
  useCallback,
  useRef,
} from 'react';

// TODO grab css from
// https://github.com/vizhub-core/vizhub/blob/01cadfb78a2611df32f981b1fd8136b70447de9e/vizhub-v2/packages/neoFrontend/src/pages/VizPage/Body/Viewer/Resizer/styles.js
// import { Wrapper, Thumb } from './styles';
// import { URLStateContext } from './URLStateContext';
import { SplitPaneResizeContext } from '../SplitPaneResizeContext';
import { FileId } from '../../types';
import './styles.scss';

export const Resizer = ({
  activeFileId,
}: {
  activeFileId: FileId | null;
}) => {
  console.log('Resizer');
  console.log('activeFileId', activeFileId);
  const showResizer: boolean = activeFileId !== null;
  // TODO research what this does
  //
  //   const { showResizer } = useContext(URLStateContext);
  const { moveSplitPane, isDragging, setIsDragging } =
    useContext(SplitPaneResizeContext);
  const previousClientX = useRef<number>(0);

  const onMouseDown = useCallback(
    (event) => {
      event.preventDefault();
      previousClientX.current = event.clientX;
      setIsDragging(true);
      document.body.style.cursor = 'col-resize';
    },
    [setIsDragging],
  );

  const onMouseMove = useCallback(
    (event) => {
      event.preventDefault();
      if (previousClientX.current !== 0) {
        const movementClientX =
          event.clientX - previousClientX.current;
        previousClientX.current = event.clientX;
        moveSplitPane(movementClientX);
      }
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

  return showResizer ? (
    <div className="vz-resizer" onMouseDown={onMouseDown}>
      <div className="vz-resizer-thumb" />
    </div>
  ) : null;
};
