import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { memo } from 'react';

interface StreamingMessageProps {
  content: string;
  status?: string;
}

const StreamingMessageComponent = ({
  content,
  status,
}: StreamingMessageProps) => {
  // Don't render if there's no content and no status
  if (!content.trim()) {
    return null;
  }

  return (
    <div className="ai-chat-message assistant streaming">
      {status && (
        <div className="ai-chat-status">{status}</div>
      )}
      <div className="ai-chat-message-content">
        <Markdown remarkPlugins={[remarkGfm]}>
          {content}
        </Markdown>
      </div>
    </div>
  );
};

export const StreamingMessage = memo(
  StreamingMessageComponent,
);
