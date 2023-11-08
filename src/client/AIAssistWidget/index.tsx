import { useCallback, useEffect, useState } from 'react';
import { Button } from '../bootstrap';
import './style.scss';
import {
  mostRecentStreamId,
  haltAIAssist,
  startAIAssist,
} from '../AIAssist';
import {
  FileId,
  ShareDBDoc,
  VZCodeContent,
} from '../../types';
import { EditorCache } from '../useEditorCache';

// From
// https://primer.style/foundations/icons/zap-24
const ZapSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
  >
    <path d="M15.716 1.329a1.341 1.341 0 0 1 2.109 1.55L15.147 9h4.161c1.623 0 2.372 2.016 1.143 3.075L8.102 22.721a1.148 1.148 0 0 1-1.81-1.317L8.996 15H4.674c-1.619 0-2.37-2.008-1.148-3.07l12.19-10.6Zm.452 1.595L4.51 13.061a.25.25 0 0 0 .164.439h5.45a.749.749 0 0 1 .692 1.041l-2.559 6.066 11.215-9.668a.25.25 0 0 0-.164-.439H14a.75.75 0 0 1-.687-1.05Z"></path>
  </svg>
);

// From Wikimedia
// https://commons.wikimedia.org/wiki/File:Stopsign.svg
const StopSVG = () => (
  <svg
    width="15pt"
    height="15pt"
    version="1.1"
    viewBox="0 0 15 15"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="scale(.75)" fill="#fff" stroke="#000">
      <path d="m17.5 0.5c1.1055 0 2 0.89453 2 2v15c0 1.1055-0.89453 2-2 2h-15c-1.1055 0-2-0.89453-2-2v-15c0-1.1055 0.89453-2 2-2z" />
    </g>
  </svg>
);

export const AIAssistWidget = ({
  activeFileId,
  shareDBDoc,
  editorCache,
}: {
  activeFileId: FileId;
  shareDBDoc: ShareDBDoc<VZCodeContent>;
  editorCache: EditorCache;
}) => {
  const [AIAssistRunning, setAIAssistRunning] =
    useState(false);

  useEffect(() => {
    shareDBDoc.on('op', (op, source) => {
      if (op !== null && op[0] === 'aiStreams') {
        //The check if the value is true is required because the value could be null rather than false.
        setAIAssistRunning(
          shareDBDoc.data.aiStreams[mostRecentStreamId]
            ?.AIStreamStatus.serverIsRunning === true,
        );
      }
    });
  });

  const handleClick = useCallback(() => {
    console.log('AI Assist clicked');
    if (!AIAssistRunning) {
      startAIAssist(
        editorCache.get(activeFileId).editor,
        shareDBDoc,
        activeFileId,
      );
    } else {
      haltAIAssist(shareDBDoc);
    }
  }, [activeFileId, AIAssistRunning]);
  return (
    <div className="vz-code-ai-assist-widget">
      <Button
        variant="light"
        title="Start AI Assist"
        onClick={handleClick}
      >
        {AIAssistRunning ? <StopSVG /> : <ZapSVG />}
      </Button>
    </div>
  );
};
