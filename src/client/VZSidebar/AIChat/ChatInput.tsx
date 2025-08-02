import {
  useRef,
  useEffect,
  useCallback,
  memo,
} from 'react';
import { Form, Button } from '../../bootstrap';

interface ChatInputProps {
  aiChatMessage: string;
  setAIChatMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  focused: boolean;
}

const ChatInputComponent = ({
  aiChatMessage,
  setAIChatMessage,
  onSendMessage,
  isLoading,
  focused,
}: ChatInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus the input when the AI chat is focused
    if (focused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [focused]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        onSendMessage();
      }
    },
    [onSendMessage],
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAIChatMessage(event.target.value);
    },
    [setAIChatMessage],
  );

  return (
    <div className="ai-chat-input-container">
      <Form.Group className="ai-chat-input-group">
        <Form.Control
          as="textarea"
          rows={2}
          value={aiChatMessage}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          placeholder="Ask me anything about your code..."
          spellCheck="false"
          disabled={isLoading}
          aria-label="Chat message input"
        />
        {aiChatMessage && (
          <div className="ai-chat-input-info">
            <span className="ai-chat-char-count">
              {aiChatMessage.length} characters
            </span>
            <span className="ai-chat-hint">Press Enter to send</span>
          </div>
        )}
        <Button
          variant="primary"
          onClick={onSendMessage}
          disabled={!aiChatMessage.trim() || isLoading}
          className="ai-chat-send-button"
          aria-label="Send message"
          title="Send message (Enter)"
        >
          Send
        </Button>
      </Form.Group>
    </div>
  );
};

export const ChatInput = memo(ChatInputComponent);
