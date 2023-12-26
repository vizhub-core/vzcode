import { useContext } from 'react';
import { enableIframe } from './featureFlags';
import { SplitPaneResizeContext } from './SplitPaneResizeContext';

export const VZRight = () => {
  const { rightPanelWidth } = useContext(
    SplitPaneResizeContext,
  );

  return (
    <div
      className="right"
      style={{ width: rightPanelWidth + 'px' }}
    >
      {enableIframe ? (
        <iframe src="http://localhost:5173/"></iframe>
      ) : null}
    </div>
  );
};
