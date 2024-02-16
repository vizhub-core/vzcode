import { useCallback, useContext, useState } from 'react';
import { OverlayTrigger, Tooltip } from '../../bootstrap';
import { SaveAndRunSVG } from '../../Icons'; 
import { Spinner } from '../Spinner';

export const SaveAndRunWidget = ({
  activeFileId,
  shareDBDoc,
  editorCache,
  tabList,
  saveAndRunTooltipText = 'Run',
}: {
  activeFileId: FileId;
  shareDBDoc: ShareDBDoc<VZCodeContent>;
  editorCache: EditorCache;
  tabList: Array<TabState>;
  saveAndRunTooltipText?: string;
}) => {

  return (
    <div className="vz-code-ai-assist-widget">
      {codeRunning ? (
        <Spinner /> // Show spinner when codeRunning is not null
      ) : (
        //showWidget && (
          <OverlayTrigger
            placement="left"
            overlay={
              <Tooltip id="ai-assist-widget-tooltip">
                {saveAndRunTooltipText}
              </Tooltip>
            }
          >
            <i
              className="icon-button icon-button-dark"
              onClick={}
            >
              <SaveAndRunSVG />
            </i>
          </OverlayTrigger>
        //)
      )}
    </div>
  );
}