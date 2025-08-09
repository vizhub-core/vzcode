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
import { enableAskMode } from '../../featureFlags';
import { useSpeechRecognition } from './useSpeechRecognition';
import { MicSVG, MicOffSVG } from '../../Icons';

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

  // Use the speech recognition hook
  const {
    isSpeaking,
    toggleSpeechRecognition,
    stopSpeaking,
  } = useSpeechRecognition(setAIChatMessage);

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

  const handleSendClick = useCallback(() => {
    // If speech recognition is active, stop it
    if (isSpeaking) {
      stopSpeaking();
    }
    onSendMessage();
  }, [onSendMessage, isSpeaking, stopSpeaking]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAIChatMessage(event.target.value);
    },
    [setAIChatMessage],
  );

  return (
    <div className="ai-chat-input-container">
      {enableAskMode && (
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
      )}
      <Form.Group className="ai-chat-input-group">
        <Form.Control
          as="textarea"
          rows={5}
          value={aiChatMessage}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          placeholder={
            aiChatMode === 'edit'
              ? 'Ask me to make code changes...'
              : 'Ask me anything about your code...'
          }
          spellCheck="false"
          disabled={isLoading}
          aria-label="Chat message input"
        />
        <div className="ai-chat-input-footer">
          <span className="ai-chat-hint">
            {aiChatMessage ? 'Press Enter to send' : ''}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant={
                isSpeaking ? 'danger' : 'outline-secondary'
              }
              size="sm"
              onClick={toggleSpeechRecognition}
              disabled={isLoading}
              aria-label={
                isSpeaking
                  ? 'Stop voice typing'
                  : 'Start voice typing'
              }
              title={
                isSpeaking
                  ? 'Stop voice typing'
                  : 'Start voice typing'
              }
              style={{
                borderColor: isSpeaking
                  ? undefined
                  : '#dee2e6',
                borderRadius: '0.375rem',
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            >
              {isSpeaking ? <MicOffSVG /> : <MicSVG />}
            </Button>
            <Button
              variant={
                aiChatMessage.trim()
                  ? 'primary'
                  : 'outline-secondary'
              }
              onClick={handleSendClick}
              disabled={!aiChatMessage.trim() || isLoading}
              className="ai-chat-send-button"
              aria-label="Send message"
              title="Send message (Enter)"
            >
              Send
            </Button>
          </div>
        </div>
      </Form.Group>
    </div>
  );
};

export const ChatInput = memo(ChatInputComponent);
