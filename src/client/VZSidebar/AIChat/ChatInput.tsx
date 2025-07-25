import {
  useRef,
  useEffect,
  useCallback,
  memo,
} from 'react';
import { Form, Button } from '../../bootstrap';

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  focused: boolean;
}

const ChatInputComponent = ({
  message,
  setMessage,
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
      setMessage(event.target.value);
    },
    [setMessage],
  );

  return (
    <div className="ai-chat-input-container">
      <Form.Group className="ai-chat-input-group">
        <Form.Control
          as="textarea"
          rows={2}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          placeholder="Describe what you'd like me to change in your code..."
          spellCheck="false"
          disabled={isLoading}
        />
        <Button
          variant="primary"
          onClick={onSendMessage}
          disabled={!message.trim() || isLoading}
          className="ai-chat-send-button"
        >
          Send
        </Button>
      </Form.Group>
    </div>
  );
};

export const ChatInput = memo(ChatInputComponent);
