import { timestampToDate } from '@vizhub/viz-utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMemo, memo } from 'react';
import { DiffView } from './DiffView';
import { FilesDiff } from '../../../utils/fileDiff';

interface MessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  diffData?: FilesDiff;
}

const MessageComponent = ({
  role,
  content,
  timestamp,
  isStreaming,
  diffData,
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
        {diffData && Object.keys(diffData).length > 0 && (
          <DiffView diffData={diffData} />
        )}
      </div>
      <div className="ai-chat-message-time">
        {formattedTime}
      </div>
    </div>
  );
};

export const Message = memo(MessageComponent);
