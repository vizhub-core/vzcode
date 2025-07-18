import {
  useRef,
  useEffect,
  useContext,
  useState,
  useCallback,
} from 'react';
import { Form, Button } from '../bootstrap';
import { VZCodeContext } from '../VZCodeContext';

export const AIChat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content:
        "Hello! I'm your AI assistant. How can I help you with your code today?",
      timestamp: new Date(),
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
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Simulate AI response (replace with actual AI integration later)
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'assistant',
        content:
          'I understand you\'re asking about: "' +
          userMessage.content +
          '". This is a placeholder response. The AI chat feature is still being developed!',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
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
              {msg.timestamp.toLocaleTimeString([], {
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
