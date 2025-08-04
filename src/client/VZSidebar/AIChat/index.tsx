import {
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { VZCodeContext } from '../../VZCodeContext';
import { v4 as uuidv4 } from 'uuid';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import './styles.scss';

const defaultAIChatEndpoint = '/api/ai-chat/';

export const AIChat = () => {
  const { aiChatMessage, setAIChatMessage } =
    useContext(VZCodeContext);

  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId] = useState(() => uuidv4());
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const {
    aiChatFocused,
    content,
    aiChatEndpoint = defaultAIChatEndpoint,
    aiChatOptions = {},
    aiChatMode,
    setAIChatMode,
    autoForkAndRetryAI,
    clearStoredAIPrompt,
    getStoredAIPrompt,
  } = useContext(VZCodeContext);

  // Get current chat data from content
  const currentChat = content?.chats?.[currentChatId];
  const rawMessages = currentChat?.messages || [];
  const aiStatus = currentChat?.aiStatus;
  const aiScratchpad = currentChat?.aiScratchpad;

  // Transform messages to ensure they have required id field - memoized to avoid recreation
  const messages = useMemo(
    () =>
      rawMessages.map((msg, index) => ({
        ...msg,
        id: msg.id || `msg-${index}`,
      })),
    [rawMessages],
  );

  // Check if this is the first time opening the chat (no messages)
  const isEmptyState = rawMessages.length === 0;

  const handleSendMessage = useCallback(
    async (messageToSend?: string) => {
      const messageContent = messageToSend || aiChatMessage;
      if (
        !messageContent ||
        typeof messageContent !== 'string' ||
        !messageContent.trim() ||
        isLoading
      )
        return;

      const currentPrompt = aiChatMessage.trim();
      setAIChatMessage('');
      setIsLoading(true);
      setErrorMessage(null); // Clear any previous errors

      // Call backend endpoint for AI response
      // The server will handle all ShareDB operations including adding the user message
      try {
        const response = await fetch(aiChatEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...aiChatOptions,
            vizId: aiChatOptions.vizId,
            content: messageContent.trim(),
            chatId: currentChatId,
            mode: aiChatMode,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status}`,
          );
        }

        // Parse the response to check for errors
        const responseData = await response.json();

        // Check if the response contains a VizHub error
        if (
          responseData.outcome === 'failure' &&
          responseData.error
        ) {
          const errorMessage = responseData.error.message;

          // Check if this is the specific permission error that should trigger auto-fork
          if (
            errorMessage ===
            'You do not have permission to use AI chat on this visualization. Only users with edit access can use this feature. Fork the viz to edit it.'
          ) {
            // Trigger auto-fork instead of showing error
            try {
              await autoForkAndRetryAI?.(
                currentPrompt,
                aiChatMode,
              );
              // If we reach here, the fork was successful and redirect should happen
              return;
            } catch (forkError) {
              console.error('Auto-fork failed:', forkError);
              setErrorMessage(
                'Failed to fork visualization. Please try forking manually.',
              );
              return;
            }
          }

          // For other errors, show the error message
          setErrorMessage(errorMessage);
          return;
        }

        // The backend handles all ShareDB operations for successful responses
      } catch (error) {
        console.error('Error getting AI response:', error);
        setErrorMessage(
          'Failed to send message. Please try again.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      aiChatMessage,
      isLoading,
      aiChatEndpoint,
      aiChatOptions,
      currentChatId,
      aiChatMode,
      autoForkAndRetryAI,
    ],
  );

  // Check for stored AI prompt on component mount (post-fork restoration)
  useEffect(() => {
    if (getStoredAIPrompt) {
      const storedPrompt = getStoredAIPrompt();
      if (storedPrompt) {
        // Restore the prompt and mode
        setAIChatMessage(storedPrompt.prompt);
        setAIChatMode(
          storedPrompt.modelName === 'ask' ? 'ask' : 'edit',
        );

        // Clear the stored prompt
        if (clearStoredAIPrompt) {
          clearStoredAIPrompt();
        }

        // Auto-submit the restored prompt after a short delay
        setTimeout(() => {
          handleSendMessage();
        }, 100);
      }
    }
  }, [
    getStoredAIPrompt,
    clearStoredAIPrompt,
    setAIChatMessage,
    setAIChatMode,
    handleSendMessage,
  ]);

  return (
    <div className="ai-chat-container">
      <div
        style={{
          padding: '10px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isEmptyState ? (
          <div className="ai-chat-empty">
            <div className="ai-chat-empty-icon">✨</div>
            <h3 className="ai-chat-empty-title">
              Hi! I'm here to help you edit with AI.
            </h3>
            <div className="ai-chat-empty-text">
              How can I help you?
            </div>
            <div className="ai-chat-empty-examples">
              {aiChatMode === 'ask' ? (
                <>
                  <h4>Try asking questions like:</h4>
                  <div className="ai-chat-suggested-prompts">
                    <button
                      className="ai-chat-suggested-prompt"
                      onClick={() =>
                        handleSendMessage(
                          'Explain how this works',
                        )
                      }
                    >
                      "Explain how this works"
                    </button>
                    <button
                      className="ai-chat-suggested-prompt"
                      onClick={() =>
                        handleSendMessage(
                          'How could I change it so that the circles are bigger?',
                        )
                      }
                    >
                      "How could I change it so that the
                      circles are bigger?"
                    </button>
                    <button
                      className="ai-chat-suggested-prompt"
                      onClick={() =>
                        handleSendMessage(
                          'What does this function do?',
                        )
                      }
                    >
                      "What does this function do?"
                    </button>
                    <button
                      className="ai-chat-suggested-prompt"
                      onClick={() =>
                        handleSendMessage(
                          'How can I make this more accessible?',
                        )
                      }
                    >
                      "How can I make this more accessible?"
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h4>Try edit requests like these:</h4>
                  <div className="ai-chat-suggested-prompts">
                    <button
                      className="ai-chat-suggested-prompt"
                      onClick={() =>
                        handleSendMessage(
                          'Change the circles to squares',
                        )
                      }
                    >
                      "Change the circles to squares"
                    </button>
                    <button
                      className="ai-chat-suggested-prompt"
                      onClick={() =>
                        handleSendMessage(
                          'Add a button that toggles the animation',
                        )
                      }
                    >
                      "Add a button that toggles the
                      animation"
                    </button>
                    <button
                      className="ai-chat-suggested-prompt"
                      onClick={() =>
                        handleSendMessage(
                          'Fix the CSS so the layout is responsive',
                        )
                      }
                    >
                      "Fix the CSS so the layout is
                      responsive"
                    </button>
                    <button
                      className="ai-chat-suggested-prompt"
                      onClick={() =>
                        handleSendMessage(
                          'Refactor this function to use async/await',
                        )
                      }
                    >
                      "Refactor this function to use
                      async/await"
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="ai-chat-empty-text">
              {aiChatMode === 'ask'
                ? 'Type your question below to get started!'
                : 'Type your edit request below to get started!'}
            </div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            aiStatus={aiStatus}
            isLoading={isLoading}
            chatId={currentChatId}
            aiScratchpad={aiScratchpad}
          />
        )}
        {errorMessage && (
          <div className="ai-chat-error">
            <div className="ai-chat-error-content">
              <span className="ai-chat-error-icon">⚠️</span>
              <span className="ai-chat-error-message">
                {errorMessage}
              </span>
              <button
                className="ai-chat-error-dismiss"
                onClick={() => setErrorMessage(null)}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
        )}
        <ChatInput
          aiChatMessage={aiChatMessage}
          setAIChatMessage={setAIChatMessage}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          focused={aiChatFocused}
          aiChatMode={aiChatMode}
          setAIChatMode={setAIChatMode}
        />
      </div>
    </div>
  );
};
