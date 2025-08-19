import {
  useRef,
  useEffect,
  useCallback,
  memo,
  useContext,
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
import { getOrCreateEditor } from '../../CodeEditor/getOrCreateEditor';
import { VZCodeContext } from '../../VZCodeContext';
import { diff } from '../../../ot';

interface ChatInputProps {
  onSendMessage: () => void;
  isLoading: boolean;
  focused: boolean;
  aiChatMode: 'ask' | 'edit';
  setAIChatMode: (mode: 'ask' | 'edit') => void;
  navigateMessageHistoryUp: () => void;
  navigateMessageHistoryDown: () => void;
  resetMessageHistoryNavigation: () => void;
}

const ChatInputComponent = ({
  onSendMessage,
  isLoading,
  focused,
  aiChatMode,
  setAIChatMode,
  navigateMessageHistoryUp,
  navigateMessageHistoryDown,
  resetMessageHistoryNavigation,
}: ChatInputProps) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  const {
    shareDBDoc,
    localPresence,
    docPresence,
    theme,
    editorCache,
    setIsAIChatOpen,
    handleSendMessage,
  } = useContext(VZCodeContext);

  // Create refs for missing properties
  const usernameRef = useRef('Anonymous');
  const enableAutoFollowRef = useRef(false);

  // Get current chat draft content from ShareDB
  const currentChatDraft =
    (shareDBDoc?.data as any)?.currentChatDraft || '';

  // Use the speech recognition hook
  const {
    isSpeaking,
    toggleSpeechRecognition,
    stopSpeaking,
  } = useSpeechRecognition((text) => {
    // Update ShareDB directly instead of local state
    if (shareDBDoc) {
      const op =
        (shareDBDoc.data as any).currentChatDraft !== text
          ? diff(shareDBDoc.data, {
              ...shareDBDoc.data,
              currentChatDraft: text,
            })
          : null;
      if (op) shareDBDoc.submitOp(op);
    }
  });

  // Initialize CodeMirror editor
  useEffect(() => {
    if (
      !editorContainerRef.current ||
      !shareDBDoc ||
      editorRef.current
    )
      return;

    const initEditor = async () => {
      try {
        const editorValue = await getOrCreateEditor({
          shareDBDoc,
          localPresence,
          docPresence,
          theme,
          editorCache,
          usernameRef,
          enableAutoFollowRef,
          setIsAIChatOpen,
          handleSendMessage,
          isChatDraftEditor: true, // Special flag for chat draft
          esLintSource: async () => [], // No linting for chat
        });

        editorRef.current = editorValue;
        editorContainerRef.current!.appendChild(
          editorValue.editor.dom,
        );

        // Set up keyboard handlers
        editorValue.editor.dom.addEventListener(
          'keydown',
          handleKeyDown,
        );
      } catch (error) {
        console.error(
          'Failed to initialize chat editor:',
          error,
        );
      }
    };

    initEditor();

    return () => {
      if (editorRef.current) {
        editorRef.current.editor.dom.removeEventListener(
          'keydown',
          handleKeyDown,
        );
      }
    };
  }, [shareDBDoc, theme]);

  // Focus handling
  useEffect(() => {
    if (focused && editorRef.current) {
      editorRef.current.editor.focus();
    }
  }, [focused]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        onSendMessage();
      } else if (event.key === 'ArrowUp') {
        // Handle message history navigation
        const editor = editorRef.current?.editor;
        if (editor) {
          const { selection } = editor.state;
          if (selection.main.head === 0) {
            event.preventDefault();
            navigateMessageHistoryUp();
          }
        }
      } else if (event.key === 'ArrowDown') {
        // Handle message history navigation
        const editor = editorRef.current?.editor;
        if (editor) {
          const { selection, doc } = editor.state;
          if (selection.main.head === doc.length) {
            event.preventDefault();
            navigateMessageHistoryDown();
          }
        }
      }
    },
    [
      onSendMessage,
      navigateMessageHistoryUp,
      navigateMessageHistoryDown,
    ],
  );

  const handleSendClick = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    }
    onSendMessage();
  }, [onSendMessage, isSpeaking, stopSpeaking]);

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
        <div
          ref={editorContainerRef}
          className="ai-chat-editor-container"
          style={{
            border: '1px solid #ced4da',
            borderRadius: '0.375rem',
            minHeight: '120px',
            padding: '8px',
          }}
        />

        <div className="ai-chat-input-footer">
          <span className="ai-chat-hint">
            {currentChatDraft.trim()
              ? 'Press Enter to send'
              : ''}
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
                currentChatDraft.trim()
                  ? 'primary'
                  : 'outline-secondary'
              }
              onClick={handleSendClick}
              disabled={
                !currentChatDraft.trim() || isLoading
              }
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
