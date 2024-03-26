import { useCallback, useContext, useState } from 'react';
import { OverlayTrigger, Tooltip } from '../../bootstrap';
import { VZCodeContext } from '../../VZCodeContext';
import {
  RequestId,
  generateRequestId,
} from '../../generateRequestId';
import { SparklesSVG } from '../../Icons';
import { startAIAssist } from '../startAIAssist';
import { Spinner } from '../Spinner';
import './style.scss';

const enableStopGeneration = false;

export const AIAssistWidget = ({
  aiAssistEndpoint,
  aiAssistOptions,
  aiAssistTooltipText = 'Start AI Assist',
  aiAssistClickOverride,
}: {
  aiAssistEndpoint: string;
  aiAssistOptions: { [key: string]: string };
  aiAssistTooltipText?: string;
  aiAssistClickOverride?: () => void;
}) => {
  const { shareDBDoc, activeFileId, tabList, editorCache } =
    useContext(VZCodeContext);

  // The stream ID of the most recent request.
  //  * If `null`, no request has been made yet.
  //  * If non-null, a request has been made, and the
  //    server is processing it.
  const [aiStreamId, setAiStreamId] =
    useState<RequestId | null>(null);

  const { runPrettierRef, runCodeRef } =
    useContext(VZCodeContext);

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

      // Trigger a Prettier run after the AI Assist.
      const runPrettier = runPrettierRef.current;
      if (runPrettier !== null) {
        runPrettier();
      }

      // Run the code after the AI Assist.
      const runCode = runCodeRef.current;
      if (runCode !== null) {
        runCode();
      }

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
    <div className="vz-code-ai-assist-widget">
      {aiStreamId ? (
        <Spinner /> // Show spinner when aiStreamId is not null
      ) : (
        showWidget && (
          <OverlayTrigger
            placement="left"
            overlay={
              <Tooltip id="ai-assist-widget-tooltip">
                {aiAssistTooltipText}
              </Tooltip>
            }
          >
            <i
              className="icon-button icon-button-dark"
              onClick={aiAssistClickOverride || handleClick}
            >
              <SparklesSVG />
            </i>
          </OverlayTrigger>
        )
      )}
    </div>
  );
};
