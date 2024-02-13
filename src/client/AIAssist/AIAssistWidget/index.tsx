import { useCallback, useEffect, useState } from 'react';
import {
  FileId,
  ShareDBDoc,
  VZCodeContent,
} from '../../../types';
import { OverlayTrigger, Tooltip } from '../../bootstrap';
import { EditorCache } from '../../useEditorCache';
import { TabState } from '../../vzReducer';
import {
  RequestId,
  generateRequestId,
} from '../../generateRequestId';
import { SparklesSVG, StopSVG } from '../../Icons';
import { startAIAssist } from '../startAIAssist';
import './style.scss';
import { Spinner } from '../Spinner';
import { usePrettier } from '../../usePrettier'; // Import Prettier hook

const enableStopGeneration = false;

export const AIAssistWidget = ({
  prettierWorker,
  submitOperation,
  activeFileId,
  shareDBDoc,
  editorCache,
  tabList,
  aiAssistEndpoint,
  aiAssistOptions,
  aiAssistTooltipText = 'Start AI Assist',
  aiAssistClickOverride,
}: {
  prettierWorker: Worker;
  submitOperation: (
    next: (content: VZCodeContent) => VZCodeContent,
  ) => void;
  activeFileId: FileId;
  shareDBDoc: ShareDBDoc<VZCodeContent>;
  editorCache: EditorCache;
  tabList: Array<TabState>;
  aiAssistEndpoint: string;
  aiAssistOptions: { [key: string]: string };
  aiAssistTooltipText?: string;
  aiAssistClickOverride?: () => void;
}) => {
  const [aiStreamId, setAiStreamId] =
    useState<RequestId | null>(null);
  const { prettierError } = usePrettier({
    shareDBDoc,
    submitOperation: submitOperation,
    prettierWorker: prettierWorker,
    enableManualPretter: false, // Enable manual Prettier execution
    // runPretter: aiStreamId,
  });
  useEffect(() => {
    console.log(aiStreamId);
  }, [aiStreamId]);
  const handleClick = useCallback(async () => {
    const isCurrentlyGenerating = aiStreamId !== null;
    if (isCurrentlyGenerating) {
      // TODO stop generation
    } else {
      const newAiStreamId = generateRequestId();
      setAiStreamId(newAiStreamId);

      await startAIAssist({
        view: editorCache.get(activeFileId).editor,
        shareDBDoc,
        fileId: activeFileId,
        tabList,
        aiStreamId: newAiStreamId,
        aiAssistEndpoint,
        aiAssistOptions,
      });

      // Run Prettier after code generation

      // Handle Prettier error if any
      if (prettierError) {
        console.error('Prettier error:', prettierError);
      }
      console.log(aiStreamId);
      setAiStreamId((currentAIStreamId) =>
        currentAIStreamId === newAiStreamId
          ? null
          : currentAIStreamId,
      );
      console.log(aiStreamId);
    }
  }, [activeFileId, aiStreamId]);

  const showWidget = enableStopGeneration
    ? true
    : aiStreamId === null;

  return (
    <div className="vz-code-ai-assist-widget">
      {aiStreamId ? (
        <Spinner />
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
