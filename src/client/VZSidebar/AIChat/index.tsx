import { useContext, useMemo, useEffect } from 'react';
import { VZCodeContext } from '../../VZCodeContext';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import './styles.scss';

const DEBUG = false;

const showSuggestedRequests = true;

export const AIChat = () => {
  const {
    aiChatFocused,
    content,
    aiChatMode,
    aiChatMessage,
    isLoading,
    currentChatId,
    aiErrorMessage,
    setAIChatMode,
    clearStoredAIPrompt,
    getStoredAIPrompt,
    setAIChatMessage,
    handleSendMessage,
    setAIErrorMessage,
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

  // Check for stored AI prompt on component mount (post-fork restoration)
  useEffect(() => {
    DEBUG &&
      console.log('AIChat: Checking for stored AI prompt');
    if (getStoredAIPrompt) {
      const storedPrompt = getStoredAIPrompt();
      DEBUG &&
        console.log(
          'AIChat: Stored prompt result:',
          storedPrompt,
        );
      if (storedPrompt) {
        // Restore the prompt and mode
        DEBUG &&
          console.log('AIChat: Restoring prompt and mode');
        setAIChatMessage(storedPrompt.prompt);
        setAIChatMode(
          storedPrompt.modelName === 'ask' ? 'ask' : 'edit',
        );

        // Clear the stored prompt
        DEBUG &&
          console.log('AIChat: Clearing stored prompt');
        clearStoredAIPrompt();

        // Auto-submit the restored prompt after a short delay
        DEBUG &&
          console.log('AIChat: Scheduling auto-submit');
        setTimeout(() => {
          DEBUG &&
            console.log(
              'AIChat: Auto-submitting restored prompt',
            );
          handleSendMessage(storedPrompt.prompt);
        }, 100);
      } else {
        DEBUG &&
          console.log('AIChat: No stored prompt found');
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
      <div className="ai-chat-content">
        <div className="ai-chat-messages-container">
          {isEmptyState ? (
            <div className="ai-chat-empty">
              <div className="ai-chat-empty-icon">✨</div>
              <h3 className="ai-chat-empty-title">
                Edit with AI
              </h3>
              <div className="ai-chat-empty-text">
                How can I help you?
              </div>
              {showSuggestedRequests && (
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
                          "How can I make this more
                          accessible?"
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
              )}
              {showSuggestedRequests && (
                <div className="ai-chat-empty-text">
                  {aiChatMode === 'ask'
                    ? 'Type your question below to get started!'
                    : 'Type your edit request below to get started!'}
                </div>
              )}
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
          {aiErrorMessage && (
            <div className="ai-chat-error">
              <div className="ai-chat-error-content">
                <span className="ai-chat-error-icon">
                  ⚠️
                </span>
                <span className="ai-chat-error-message">
                  {aiErrorMessage}
                </span>
                <button
                  className="ai-chat-error-dismiss"
                  onClick={() => setAIErrorMessage(null)}
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="ai-chat-input-fixed">
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
