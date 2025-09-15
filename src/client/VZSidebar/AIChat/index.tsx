import {
  useContext,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { VZCodeContext } from '../../VZCodeContext';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { AIEditStatus } from './AIEditStatus';
import { scrollToFirstDiff, getHeaderOffset, announceDiffSummary } from '../../utils/scrollUtils';
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
    aiChatMessage,
    isLoading,
    currentChatId,
    selectedChatId,
    setSelectedChatId,
    aiErrorMessage,
    setAIChatMode,
    clearStoredAIPrompt,
    getStoredAIPrompt,
    setAIChatMessage,
    handleSendMessage,
    setAIErrorMessage,
    navigateMessageHistoryUp,
    navigateMessageHistoryDown,
    resetMessageHistoryNavigation,
    enableMinimalEditFlow,
  } = useContext(VZCodeContext);

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

  // For Phase 1: Create mock file statuses from current AI status
  // TODO: Replace with actual structured status events from server in later phases
  const mockFileStatuses = useMemo(() => {
    if (!isLoading || !enableMinimalEditFlow) return [];
    
    // Create a simple mock status based on current loading state
    // In the future, this will come from structured server events
    return [
      {
        filename: 'Processing request...',
        operation: 'editing' as const,
        status: 'in-progress' as const,
      }
    ];
  }, [isLoading, enableMinimalEditFlow]);

  // Phase 2: Track loading state changes for auto-scroll behavior
  const prevIsLoadingRef = useRef(isLoading);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to diff when generation completes in minimal flow
  useEffect(() => {
    const prevIsLoading = prevIsLoadingRef.current;
    prevIsLoadingRef.current = isLoading;

    // Only trigger auto-scroll in minimal edit flow when generation completes
    if (enableMinimalEditFlow && prevIsLoading && !isLoading) {
      // Small delay to ensure MessageList and DiffView have rendered
      setTimeout(() => {
        // Look for DiffView in the rendered content
        const diffContainer = document.querySelector('.diff-files');
        if (diffContainer) {
          const headerOffset = getHeaderOffset();
          scrollToFirstDiff(diffContainer as HTMLElement, headerOffset);
          announceDiffSummary(diffContainer as HTMLElement);
        }
      }, 100);
    }
  }, [isLoading, enableMinimalEditFlow]);

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
  // This logic is now handled by the AutoSendAIMessage component in VizHub
  // to ensure proper timing and coordination with editor opening
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
        // Only restore the prompt and mode, but don't auto-send
        // The AutoSendAIMessage component will handle the sending
        DEBUG &&
          console.log(
            'AIChat: Restoring prompt and mode only',
          );
        setAIChatMessage(storedPrompt.prompt);
        setAIChatMode(
          storedPrompt.modelName === 'ask' ? 'ask' : 'edit',
        );

        // Don't clear the stored prompt here - let AutoSendAIMessage handle it
        // Don't auto-submit here - let AutoSendAIMessage handle the timing
        DEBUG &&
          console.log(
            'AIChat: Prompt restored, waiting for AutoSendAIMessage to handle sending',
          );
      } else {
        DEBUG &&
          console.log('AIChat: No stored prompt found');
      }
    }
  }, [getStoredAIPrompt, setAIChatMessage, setAIChatMode]);

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
            enableMinimalEditFlow && isLoading ? (
              <AIEditStatus
                fileStatuses={mockFileStatuses}
                isGenerating={isLoading}
                aiStatus={aiStatus}
              />
            ) : (
              <MessageList
                messages={messages}
                isLoading={isLoading}
                chatId={selectedChatId || currentChatId}
                aiScratchpad={aiScratchpad}
              />
            )
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
