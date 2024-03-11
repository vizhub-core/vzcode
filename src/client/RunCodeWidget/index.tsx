import { useCallback, useContext } from 'react';
import { PlaySVG } from '../Icons';
import { VZCodeContext } from '../VZCodeContext';
import { OverlayTrigger, Tooltip } from '../bootstrap';
import './style.scss';

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
  const { runCodeRef, runPrettierRef } =
    useContext(VZCodeContext);

  const handleClick = useCallback(() => {
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
  }, []);

  return (
    <div className="vz-code-run-code-widget">
      <OverlayTrigger
        placement="left"
        overlay={
          <Tooltip id="run-code-widget-tooltip">
            {runCodeWidgetTooltipText}
          </Tooltip>
        }
      >
        <i
          className="icon-button icon-button-dark"
          onClick={handleClick}
        >
          <PlaySVG />
        </i>
      </OverlayTrigger>
    </div>
  );
};
