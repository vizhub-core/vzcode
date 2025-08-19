import {
  useContext,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { VZCodeContext } from '../../VZCodeContext';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import './styles.scss';

const DEBUG = false;

const showSuggestedRequests = false;

const showPreviousChats = false;

// Component for displaying the list of existing chats
const ChatList = ({
  chats,
  selectedChatId,
  onSelectChat,
  getChatTitle,
}) => {
  return (
    <div className="ai-chat-list">
      <div className="ai-chat-list-header">
        <h4>Previous Chats</h4>
      </div>
      <div className="ai-chat-suggested-prompts">
        {chats.map((chat) => (
          <button
            key={chat.id}
            className={`ai-chat-suggested-prompt ${
              selectedChatId === chat.id ? 'selected' : ''
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            {getChatTitle(chat)}
          </button>
        ))}
      </div>
    </div>
  );
};

export const AIChat = () => {
  const {
    aiChatFocused,
    content,
    aiChatMode,
    isLoading,
    currentChatId,
    selectedChatId,
    setSelectedChatId,
    aiErrorMessage,
    setAIChatMode,
    clearStoredAIPrompt,
    getStoredAIPrompt,
    handleSendMessage,
    setAIErrorMessage,
    navigateMessageHistoryUp,
    navigateMessageHistoryDown,
    resetMessageHistoryNavigation,
  } = useContext(VZCodeContext);

  // Get current chat draft content from ShareDB (at root level)
  const currentChatDraft = (content as any)?.currentChatDraft || '';

  // Get the active chat ID and chat data
  // If selectedChatId is set, use it; otherwise, if no chat selected, don't default to currentChatId
  const activeChatId = selectedChatId;
  const currentChat = activeChatId
    ? content?.chats?.[activeChatId]
    : null;
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

  // Check if this is the first time opening the chat (no messages) or no chat selected
  const isEmptyState =
    !selectedChatId || rawMessages.length === 0;

  // Get all existing chats
  const allChats = content?.chats || {};
  const existingChats = Object.values(allChats).filter(
    (chat) => chat.messages.length > 0,
  );
  const hasExistingChats = existingChats.length > 0;

  // Generate title for a chat (first 50 characters of first user message)
  const getChatTitle = (chat) => {
    const firstUserMessage = chat.messages.find(
      (msg) => msg.role === 'user',
    );
    if (!firstUserMessage) return 'New Chat';
    return (
      firstUserMessage.content.slice(0, 50) +
      (firstUserMessage.content.length > 50 ? '...' : '')
    );
  };

  // Wrapper for handleSendMessage to automatically select the chat when sending
  const handleSendMessageWithSelection = useCallback(() => {
    // If no chat is selected, select the currentChatId when sending a message
    if (!selectedChatId) {
      setSelectedChatId(currentChatId);
    }

    // Call the original handleSendMessage without parameters
    return handleSendMessage();
  }, [
    selectedChatId,
    setSelectedChatId,
    currentChatId,
    handleSendMessage,
  ]);

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
        // TODO: Update ShareDB currentChatDraft with storedPrompt.prompt
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
              {hasExistingChats && showPreviousChats && (
                <ChatList
                  chats={existingChats}
                  selectedChatId={selectedChatId}
                  onSelectChat={setSelectedChatId}
                  getChatTitle={getChatTitle}
                />
              )}
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
              isLoading={isLoading}
              chatId={selectedChatId || currentChatId}
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
          onSendMessage={handleSendMessageWithSelection}
          isLoading={isLoading}
          focused={aiChatFocused}
          aiChatMode={aiChatMode}
          setAIChatMode={setAIChatMode}
          navigateMessageHistoryUp={
            navigateMessageHistoryUp
          }
          navigateMessageHistoryDown={
            navigateMessageHistoryDown
          }
          resetMessageHistoryNavigation={
            resetMessageHistoryNavigation
          }
        />
      </div>
    </div>
  );
};
