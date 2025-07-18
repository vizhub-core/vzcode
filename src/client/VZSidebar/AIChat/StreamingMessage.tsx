import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StreamingMessageProps {
  content: string;
  status?: string;
}

export const StreamingMessage = ({
  content,
  status,
}: StreamingMessageProps) => {
  return (
    <div className="ai-chat-message assistant streaming">
      <div className="ai-chat-message-content">
        <Markdown remarkPlugins={[remarkGfm]}>
          {content}
        </Markdown>
      </div>
      {status && (
        <div className="ai-chat-status">{status}</div>
      )}
    </div>
  );
};
