import {
  useRef,
  useEffect,
  useContext,
  useState,
  useCallback,
} from 'react';
import { Form, Button } from '../../bootstrap';
import { VZCodeContext } from '../../VZCodeContext';
import { timestampToDate } from '@vizhub/viz-utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';
import './styles.scss';

export const AIChat = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId] = useState(() => uuidv4());
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { aiChatFocused, content } =
    useContext(VZCodeContext);

  // Get current chat data from content
  const currentChat = content?.chats?.[currentChatId];
  const messages = currentChat?.messages || [];
  const aiScratchpad = currentChat?.aiScratchpad;
  const aiStatus = currentChat?.aiStatus;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiScratchpad]);

  useEffect(() => {
    // Focus the input when the AI chat is focused
    if (aiChatFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [aiChatFocused]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isLoading) return;

    setMessage('');
    setIsLoading(true);

    // Call backend endpoint for AI response
    // The server will handle all ShareDB operations including adding the user message
    try {
      const response = await fetch('/ai-chat-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message.trim(),
          chatId: currentChatId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}`,
        );
      }

      // The backend handles all ShareDB operations
      await response.json();
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Server will handle error messages too
    } finally {
      setIsLoading(false);
    }
  }, [message, isLoading, currentChatId]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`ai-chat-message ${msg.role === 'user' ? 'user' : 'assistant'}`}
          >
            <div className="ai-chat-message-content">
              <Markdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </Markdown>
            </div>
            <div className="ai-chat-message-time">
              {timestampToDate(
                msg.timestamp,
              ).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}

        {/* Show streaming content if available */}
        {aiScratchpad && (
          <div className="ai-chat-message assistant streaming">
            <div className="ai-chat-message-content">
              <Markdown remarkPlugins={[remarkGfm]}>
                {aiScratchpad}
              </Markdown>
            </div>
            {aiStatus && (
              <div className="ai-chat-status">
                {aiStatus}
              </div>
            )}
          </div>
        )}

        {isLoading && !aiScratchpad && (
          <div className="ai-chat-message assistant">
            <div className="ai-chat-message-content">
              <div className="ai-chat-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-input-container">
        <Form.Group className="ai-chat-input-group">
          <Form.Control
            as="textarea"
            rows={2}
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            ref={inputRef}
            placeholder="Describe what you'd like me to change in your code..."
            spellCheck="false"
            disabled={isLoading}
          />
          <Button
            variant="primary"
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="ai-chat-send-button"
          >
            Send
          </Button>
        </Form.Group>
      </div>
    </div>
  );
};
