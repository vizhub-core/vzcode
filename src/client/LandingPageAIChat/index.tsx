import { useContext, useState, useCallback } from 'react';
import { VZCodeContext } from '../VZCodeContext';
import { v4 as uuidv4 } from 'uuid';
import { MessageList } from '../VZSidebar/AIChat/MessageList';
import { ChatInput } from '../VZSidebar/AIChat/ChatInput';
import { AIChatSVG, CloseSVG } from '../Icons';
import './styles.scss';

const defaultAIChatEndpoint = '/ai-chat-message';

export const LandingPageAIChat = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId] = useState(() => uuidv4());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const {
    content,
    aiChatEndpoint = defaultAIChatEndpoint,
    aiChatOptions = {},
  } = useContext(VZCodeContext);

  // Get current chat data from content
  const currentChat = content?.chats?.[currentChatId];
  const rawMessages = currentChat?.messages || [];
  const aiScratchpad = currentChat?.aiScratchpad;
  const aiStatus = currentChat?.aiStatus;

  // Transform messages to ensure they have required id field
  const messages = rawMessages.map((msg, index) => ({
    ...msg,
    id: msg.id || `msg-${index}`,
  }));

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isLoading) return;

    setMessage('');
    setIsLoading(true);

    // Call backend endpoint for AI response
    try {
      const response = await fetch(aiChatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...aiChatOptions,
          content: message.trim(),
          chatId: currentChatId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}`,
        );
      }

      await response.json();
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  }, [message, isLoading, currentChatId]);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsExpanded(false);
  };

  const handleClose = () => {
    setIsMinimized(true);
    setIsExpanded(false);
  };

  if (isMinimized) {
    return (
      <div
        className="landing-ai-chat-minimized"
        onClick={() => setIsMinimized(false)}
      >
        <div className="minimized-icon">
          <AIChatSVG />
        </div>
        <span>AI Chat</span>
      </div>
    );
  }

  return (
    <div
      className={`landing-ai-chat ${isExpanded ? 'expanded' : 'compact'}`}
    >
      <div className="landing-ai-chat-header">
        <div className="header-left">
          <AIChatSVG />
          <span>AI Assistant</span>
        </div>
        <div className="header-controls">
          <button
            className="control-button"
            onClick={handleToggleExpand}
            title={isExpanded ? 'Compact view' : 'Expand'}
          >
            {isExpanded ? '−' : '+'}
          </button>
          <button
            className="control-button"
            onClick={handleClose}
            title="Minimize"
          >
            <CloseSVG />
          </button>
        </div>
      </div>

      <div className="landing-ai-chat-content">
        {isExpanded ? (
          <>
            <MessageList
              messages={messages}
              aiScratchpad={aiScratchpad}
              aiStatus={aiStatus}
              isLoading={isLoading}
            />
            <ChatInput
              message={message}
              setMessage={setMessage}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              focused={false}
            />
          </>
        ) : (
          <div className="compact-chat">
            <ChatInput
              message={message}
              setMessage={setMessage}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              focused={false}
            />
            {messages.length > 0 && (
              <div className="message-count">
                {messages.length} message
                {messages.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
