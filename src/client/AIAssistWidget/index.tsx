import { useCallback } from 'react';
import { Button } from '../bootstrap';
import { startAIAssist } from '../AIAssist';
import {
  FileId,
  ShareDBDoc,
  VZCodeContent,
} from '../../types';
import { EditorCache } from '../useEditorCache';
import { TabState } from '../vzReducer';
import { SparklesSVG, StopSVG } from '../Icons';
import './style.scss';

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
  // const [AIAssistRunning, setAIAssistRunning] =
  //   useState(false);

  // useEffect(() => {
  //   const handleOp = (op, source) => {
  //     if (op !== null && op[0] === 'aiStreams') {
  //       // The check if the value is true is required
  //       // because the value could be null rather than false.
  //       setAIAssistRunning(
  //         shareDBDoc.data.aiStreams[mostRecentStreamId]
  //           ?.AIStreamStatus.serverIsRunning === true,
  //       );
  //     }
  //   };
  //   shareDBDoc.on('op', handleOp);

  //   return () => {
  //     shareDBDoc.off('op', handleOp);
  //   };
  // }, [shareDBDoc]);

  const handleClick = useCallback(() => {
    // TODO stop it
    // if (!AIAssistRunning) {
    startAIAssist(
      editorCache.get(activeFileId).editor,
      shareDBDoc,
      activeFileId,
      tabList,
    );
    // } else {
    //   haltAIAssist(shareDBDoc);
    // }
  }, [activeFileId]);

  // TODO set this up
  const isGenerating = false;

  return (
    <div className="vz-code-ai-assist-widget">
      <Button
        variant="light"
        title="Start AI Assist"
        onClick={handleClick}
      >
        {isGenerating ? <StopSVG /> : <SparklesSVG />}
      </Button>
    </div>
  );
};
