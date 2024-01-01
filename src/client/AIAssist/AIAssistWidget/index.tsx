import { useCallback, useState } from 'react';
import {
  FileId,
  ShareDBDoc,
  VZCodeContent,
} from '../../../types';
import {
  Button,
  OverlayTrigger,
  Tooltip,
} from '../../bootstrap';
import { EditorCache } from '../../useEditorCache';
import { TabState } from '../../vzReducer';
import {
  RequestId,
  generateRequestId,
} from '../../generateRequestId';
import { SparklesSVG, StopSVG } from '../../Icons';
import { startAIAssist } from '../startAIAssist';
import './style.scss';

const enableStopGeneration = false;

export const AIAssistWidget = ({
  activeFileId,
  shareDBDoc,
  editorCache,
  tabList,
  aiAssistEndpoint,
  aiAssistOptions,
  aiAssistTooltipText = 'Start AI Assist',
  aiAssistClickOverride,
}: {
  activeFileId: FileId;
  shareDBDoc: ShareDBDoc<VZCodeContent>;
  editorCache: EditorCache;
  tabList: Array<TabState>;
  aiAssistEndpoint: string;
  aiAssistOptions: { [key: string]: string };
  aiAssistTooltipText?: string;
  aiAssistClickOverride?: () => void;
}) => {
  // The stream ID of the most recent request.
  //  * If `null`, no request has been made yet.
  //  * If non-null, a request has been made, and the
  //    server is processing it.
  const [aiStreamId, setAiStreamId] =
    useState<RequestId | null>(null);

  const handleClick = useCallback(async () => {
    const isCurrentlyGenerationg = aiStreamId !== null;
    if (isCurrentlyGenerationg) {
      // TODO stop generation
    } else {
      const newAiStreamId = generateRequestId();
      setAiStreamId(newAiStreamId);

      // Wait for generation to finish.
      await startAIAssist({
        view: editorCache.get(activeFileId).editor,
        shareDBDoc,
        fileId: activeFileId,
        tabList,
        aiStreamId: newAiStreamId,
        aiAssistEndpoint,
        aiAssistOptions,
      });

      // Handles the case that the user has started,
      // stopped, and started again before the first request
      // has finished, bu comparing the current stream ID
      // with the stream ID that was active when the request
      // was started.
      setAiStreamId((currentAIStreamId) =>
        currentAIStreamId === newAiStreamId
          ? null
          : currentAIStreamId,
      );
    }
  }, [activeFileId, aiStreamId]);

  const showWidget = enableStopGeneration
    ? true
    : aiStreamId === null;

  return (
    showWidget && (
      <div className="vz-code-ai-assist-widget">
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="ai-assist-widget-tooltip">
              {aiAssistTooltipText}
            </Tooltip>
          }
        >
          <Button
            onClick={aiAssistClickOverride || handleClick}
          >
            {aiStreamId ? (
              enableStopGeneration ? (
                <StopSVG />
              ) : null
            ) : (
              <SparklesSVG />
            )}
          </Button>
        </OverlayTrigger>
      </div>
    )
  );
};
