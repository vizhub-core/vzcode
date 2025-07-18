import { timestampToDate } from '@vizhub/viz-utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export const Message = ({
  role,
  content,
  timestamp,
  isStreaming,
}: MessageProps) => {
  return (
    <div
      className={`ai-chat-message ${role}${isStreaming ? ' streaming' : ''}`}
    >
      <div className="ai-chat-message-content">
        <Markdown remarkPlugins={[remarkGfm]}>
          {content}
        </Markdown>
      </div>
      <div className="ai-chat-message-time">
        {timestampToDate(timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
};
