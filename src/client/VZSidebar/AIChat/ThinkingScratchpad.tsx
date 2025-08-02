import { memo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ThinkingScratchpadProps {
  content: string;
  isVisible: boolean;
}

const ThinkingScratchpadComponent = ({
  content,
  isVisible,
}: ThinkingScratchpadProps) => {
  if (!isVisible || !content) {
    return null;
  }

  return (
    <div className="thinking-scratchpad">
      <div className="thinking-scratchpad-header">
        <span className="thinking-scratchpad-icon">🧠</span>
        <span className="thinking-scratchpad-title">VizBot is thinking...</span>
      </div>
      <div className="thinking-scratchpad-content">
        <Markdown remarkPlugins={[remarkGfm]}>
          {content}
        </Markdown>
      </div>
    </div>
  );
};

export const ThinkingScratchpad = memo(ThinkingScratchpadComponent);