import { useCallback, useContext, useState } from 'react';
import { OverlayTrigger, Tooltip } from '../../bootstrap';
import { FileId, PaneId, TabState } from '../../../types';
import { VZCodeContext } from '../../VZCodeContext';
import {
  RequestId,
  generateRequestId,
} from '../../generateRequestId';
import { SparklesSVG } from '../../Icons';
import { startAIAssist } from '../startAIAssist';
import { editorCacheKey } from '../../useEditorCache';
import { Spinner } from '../Spinner';
import './style.scss';

const enableStopGeneration = false;
const modelOptions = ['GPT-4o', 'Claude']; // Customize models here

export const AIAssistWidget = ({
  aiAssistEndpoint,
  aiAssistOptions,
  aiAssistTooltipText = 'Start AI Assist',
  aiAssistClickOverride,
  activeFileId,
  tabList,
  paneId,
}: {
  aiAssistEndpoint: string;
  aiAssistOptions: { [key: string]: string };
  aiAssistTooltipText?: string;
  aiAssistClickOverride?: () => void;
  activeFileId: FileId;
  tabList: Array<TabState>;
  paneId: PaneId;
}) => {
  const {
    shareDBDoc,
    editorCache,
    runPrettierRef,
    runCodeRef,
  } = useContext(VZCodeContext);

  // The stream ID of the most recent request.
  //  * If `null`, no request has been made yet.
  //  * If non-null, a request has been made, and the
  //    server is processing it.
  const [aiStreamId, setAiStreamId] =
    useState<RequestId | null>(null);

  const [selectedModel, setSelectedModel] = useState(
    modelOptions[0],
  ); // Default to first model

  const handleClick = useCallback(async () => {
    const isCurrentlyGenerationg = aiStreamId !== null;
    if (isCurrentlyGenerationg) {
      // TODO stop generation
    } else {
      const newAiStreamId = generateRequestId();
      setAiStreamId(newAiStreamId);

      // Wait for generation to finish.
      await startAIAssist({
        view: editorCache.get(
          editorCacheKey(activeFileId, paneId),
        ).editor,
        shareDBDoc,
        fileId: activeFileId,
        tabList,
        aiStreamId: newAiStreamId,
        aiAssistEndpoint,
        aiAssistOptions,
        selectedModel: 'defaultModel', // Add the appropriate model here
      });

      // Introduce a delay before running Prettier
      // and the code, to give the ShareDB ops a chance
      // to be applied and to propagate via WebSockets
      // to the client. This is necessary because sometimes
      // the ShareDB ops from the AI assist actually don't
      // reach the client until AFTER the response comes back
      // from `await startAIAssist`.
      await new Promise((resolve) =>
        setTimeout(resolve, 1000),
      );

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
      // has finished, by comparing the current stream ID
      // with the stream ID that was active when the request
      // was started.
      setAiStreamId((currentAIStreamId) =>
        currentAIStreamId === newAiStreamId
          ? null
          : currentAIStreamId,
      );
    }
  }, [activeFileId, paneId, aiStreamId]);

  const showWidget = enableStopGeneration
    ? true
    : aiStreamId === null;

  return (
    <div className="vz-code-ai-assist-widget">
      {aiStreamId ? (
        <Spinner />
      ) : (
        showWidget && (
          <div>
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
                onClick={
                  aiAssistClickOverride || handleClick
                }
              >
                <SparklesSVG />
              </i>
            </OverlayTrigger>
            <select
              value={selectedModel}
              onChange={(e) =>
                setSelectedModel(e.target.value)
              }
              className="model-dropdown"
              style={{ marginLeft: '10px' }}
            >
              {modelOptions.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        )
      )}
    </div>
  );
};
