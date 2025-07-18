import {
  useRef,
  useEffect,
  useContext,
  useState,
  useCallback,
} from 'react';
import { Form, Button } from '../../bootstrap';
import { VZCodeContext } from '../../VZCodeContext';
import {
  dateToTimestamp,
  timestampToDate,
} from '@vizhub/viz-utils';
import './styles.scss';

// TODO pass in the content from the ShareDB doc
export const AIChat = () => {
  // TODO remove these `useState` calls,
  // replace it with `content.chats` from the ShareDB doc
  // see the `VizChats` type from @vizhub/viz-types
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content:
        "Hello! I'm your AI assistant. How can I help you with your code today?",
      timestamp: dateToTimestamp(new Date()),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { aiChatFocused } = useContext(VZCodeContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus the input when the AI chat is focused
    if (aiChatFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [aiChatFocused]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message.trim(),
      timestamp: dateToTimestamp(new Date()),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Call backend endpoint for AI response
    try {
      const response = await fetch('/ai-chat-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}`,
        );
      }

      const aiResponse = await response.json();
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback error message
      const errorResponse = {
        id: Date.now() + 1,
        type: 'assistant',
        content:
          'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: dateToTimestamp(new Date()),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [message, isLoading]);

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
            className={`ai-chat-message ${msg.type === 'user' ? 'user' : 'assistant'}`}
          >
            <div className="ai-chat-message-content">
              {msg.content}
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
        {isLoading && (
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
            placeholder="Ask me anything about your code..."
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
