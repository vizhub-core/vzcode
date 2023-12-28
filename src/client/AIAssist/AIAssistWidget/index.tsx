import { useCallback, useState } from 'react';
import {
  FileId,
  ShareDBDoc,
  VZCodeContent,
} from '../../../types';
import { Button } from '../../bootstrap';
import { EditorCache } from '../../useEditorCache';
import { TabState } from '../../vzReducer';
import { SparklesSVG, StopSVG } from '../../Icons';
import { startAIAssist } from '../startAIAssist';
import './style.scss';
import {
  RequestId,
  generateRequestId,
} from '../../generateRequestId';

export const AIAssistWidget = ({
  activeFileId,
  shareDBDoc,
  editorCache,
  tabList,
}: {
  activeFileId: FileId;
  shareDBDoc: ShareDBDoc<VZCodeContent>;
  editorCache: EditorCache;
  tabList: Array<TabState>;
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

  return (
    <div className="vz-code-ai-assist-widget">
      <Button title="Start AI Assist" onClick={handleClick}>
        {aiStreamId ? <StopSVG /> : <SparklesSVG />}
      </Button>
    </div>
  );
};
