import { useCallback, useContext, useState } from 'react';
import { PlaySVG } from '../Icons';
import { SplitEditorSVG } from '../Icons/SplitEditorSVG';
import { VZCodeContext } from '../VZCodeContext';
import { OverlayTrigger, Tooltip } from '../bootstrap';

import './style.scss';

// Feature flag for split pane feature (WIP)
const enableSplitPane = true;

export const RunCodeWidget = ({
  runCodeWidgetTooltipText = (
    <>
      <strong>Run Code</strong>
      <div>(Shift + Enter or Ctrl + s)</div>
    </>
  ),
}: {
  runCodeWidgetTooltipText?: JSX.Element;
}) => {
  const { runCodeRef, runPrettierRef, splitCurrentPane } =
    useContext(VZCodeContext);
  const [isRunning, setIsRunning] = useState(false);

  const handleClick = useCallback(() => {
    setIsRunning(true); // Set the running state to true

    // Run Prettier
    const runPrettier = runPrettierRef.current;
    if (runPrettier !== null) {
      runPrettier();
    }

    // Run the code
    const runCode = runCodeRef.current;
    if (runCode !== null) {
      runCode();
    }

    // Optional: reset the icon state after animation completes (e.g., 1 second)
    setTimeout(() => setIsRunning(false), 1000);
  }, []);

  const handleSplitEditor = useCallback(() => {
    console.log('Split Editor');
    console.log(splitCurrentPane);
    splitCurrentPane();
  }, [splitCurrentPane]);

  return (
    <div>
      <div className="vz-code-split-view-widget">
        {enableSplitPane && (
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id="fork-file-tooltip">
                Split Editor
              </Tooltip>
            }
          >
            <i
              onClick={handleSplitEditor}
              className="icon-button icon-button-dark"
            >
              <SplitEditorSVG />
            </i>
          </OverlayTrigger>
        )}
      </div>
      <div className="vz-code-run-code-widget">
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id="run-code-widget-tooltip">
              {runCodeWidgetTooltipText}
            </Tooltip>
          }
        >
          <i
            className={`icon-button icon-button-dark ${isRunning ? 'rotate-icon' : ''}`}
            onClick={handleClick}
          >
            <PlaySVG />
          </i>
        </OverlayTrigger>
      </div>
    </div>
  );
};
