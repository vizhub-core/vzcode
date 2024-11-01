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
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    <div
      className="vz-code-ai-assist-widget"
      style={{ display: 'flex', alignItems: 'center' }}
    >
      {aiStreamId ? (
        <Spinner />
      ) : (
        showWidget && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
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

            <div
              style={{
                position: 'relative',
                marginLeft: '10px',
              }}
            >
              <button
                onClick={() =>
                  setDropdownOpen(!dropdownOpen)
                }
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {selectedModel} ▼
              </button>
              {dropdownOpen && (
                <ul
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '0',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '4px',
                    boxShadow:
                      '0 4px 8px rgba(0, 0, 0, 0.1)',
                    zIndex: 10,
                    minWidth: '100%',
                    padding: 0,
                    listStyleType: 'none',
                  }}
                >
                  {modelOptions.map((model) => (
                    <li
                      key={model}
                      onClick={() => {
                        setSelectedModel(model);
                        setDropdownOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          '#f0f0f0')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          'white')
                      }
                    >
                      {model}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};
