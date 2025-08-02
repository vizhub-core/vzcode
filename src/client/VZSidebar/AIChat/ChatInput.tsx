import {
  useRef,
  useEffect,
  useCallback,
  memo,
} from 'react';
import {
  Form,
  Button,
  ButtonGroup,
  ToggleButton,
} from '../../bootstrap';

interface ChatInputProps {
  aiChatMessage: string;
  setAIChatMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  focused: boolean;
  aiChatMode: 'ask' | 'edit';
  setAIChatMode: (mode: 'ask' | 'edit') => void;
}

const ChatInputComponent = ({
  aiChatMessage,
  setAIChatMessage,
  onSendMessage,
  isLoading,
  focused,
  aiChatMode,
  setAIChatMode,
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
      <div
        className="ai-chat-mode-toggle"
        style={{ marginBottom: '8px' }}
      >
        <ButtonGroup size="sm">
          <ToggleButton
            id="ai-chat-mode-ask"
            type="radio"
            variant={
              aiChatMode === 'ask'
                ? 'primary'
                : 'outline-primary'
            }
            name="ai-chat-mode"
            value="ask"
            checked={aiChatMode === 'ask'}
            onChange={() => setAIChatMode('ask')}
            disabled={isLoading}
          >
            💬 Ask
          </ToggleButton>
          <ToggleButton
            id="ai-chat-mode-edit"
            type="radio"
            variant={
              aiChatMode === 'edit'
                ? 'primary'
                : 'outline-primary'
            }
            name="ai-chat-mode"
            value="edit"
            checked={aiChatMode === 'edit'}
            onChange={() => setAIChatMode('edit')}
            disabled={isLoading}
          >
            ✏️ Edit
          </ToggleButton>
        </ButtonGroup>
        <div className="ai-chat-mode-description">
          {aiChatMode === 'ask'
            ? 'Ask questions without editing files'
            : 'Get answers and code edits'}
        </div>
      </div>
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
            <span className="ai-chat-hint">
              Shift+Enter for new line
            </span>
            <span className="ai-chat-hint">
              Press Enter to send
            </span>
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
