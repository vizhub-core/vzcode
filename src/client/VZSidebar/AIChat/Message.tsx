import { timestampToDate } from '@vizhub/viz-utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMemo, memo } from 'react';
import { DiffView } from './DiffView';
import { UnifiedFilesDiff } from '../../../utils/fileDiff';
import { enableDiffView } from '../../featureFlags';

interface MessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  diffData?: UnifiedFilesDiff;
  beforeFiles?: any;
  chatId?: string;
  canUndo?: boolean;
}

const MessageComponent = ({
  id,
  role,
  content,
  timestamp,
  isStreaming,
  diffData,
  beforeFiles,
  chatId,
  canUndo,
}: MessageProps) => {
  // Memoize date formatting to avoid repeated computation
  const formattedTime = useMemo(() => {
    return timestampToDate(timestamp).toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  }, [timestamp]);

  // Memoize the className string to avoid recreation
  const messageClassName = useMemo(() => {
    return `ai-chat-message ${role}${isStreaming ? ' streaming' : ''}`;
  }, [role, isStreaming]);

  return (
    <div className={messageClassName}>
      <div className="ai-chat-message-content">
        <Markdown remarkPlugins={[remarkGfm]}>
          {content}
        </Markdown>
        {enableDiffView &&
          diffData &&
          Object.keys(diffData).length > 0 && (
            <DiffView
              diffData={diffData}
              messageId={id}
              chatId={chatId}
              beforeFiles={beforeFiles}
              canUndo={canUndo}
            />
          )}
      </div>
      <div className="ai-chat-message-time">
        {formattedTime}
      </div>
    </div>
  );
};

export const Message = memo(MessageComponent);
