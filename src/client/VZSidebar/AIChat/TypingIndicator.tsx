import { memo } from 'react';

const TypingIndicatorComponent = () => {
  return (
    <div className="ai-chat-message assistant">
      <div className="ai-chat-message-content">
        <div className="ai-chat-typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export const TypingIndicator = memo(TypingIndicatorComponent);
