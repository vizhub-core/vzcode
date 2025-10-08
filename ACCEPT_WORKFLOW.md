# Accept Workflow for AI Code Edits

This document describes the "Accept" workflow implementation for AI code edits in VZCode.

## Overview

After receiving an AI response, users should be able to click an "Accept" button to:
1. Accept the AI changes
2. Clear the chat history
3. Re-enable text entry for the next interaction

## Implementation

The workflow is implemented through two parameters passed to VZCodeContext:

### 1. `enableAIChatTextEntry` (boolean, optional)

Controls whether the chat input textarea is enabled or disabled.

- When `true` (default): User can type in the chat input
- When `false`: Chat input is disabled (grayed out)

### 2. `clearChatHistory` (function, optional)

Callback function that clears the chat history when called.

## Usage Example (for parent applications like VizHub)

```tsx
import { VZCodeProvider } from 'vzcode';

function MyApp() {
  const [enableTextEntry, setEnableTextEntry] = useState(true);
  
  // Clear chat history function
  const clearChatHistory = useCallback(() => {
    // Clear messages from the current chat
    submitOperation((content) => {
      const chatId = getCurrentChatId();
      return {
        ...content,
        chats: {
          ...content.chats,
          [chatId]: {
            ...content.chats[chatId],
            messages: [],
          },
        },
      };
    });
    
    // Re-enable text entry
    setEnableTextEntry(true);
  }, [submitOperation]);
  
  // Provide Accept button in additionalWidgets
  const additionalWidgets = useCallback(({ chatId, messageId }) => {
    return (
      <div>
        <button onClick={() => {
          // Undo logic here
        }}>Undo</button>
        
        <button onClick={() => {
          // Try Harder logic here
        }}>Try Harder</button>
        
        <button onClick={() => {
          clearChatHistory();
        }}>Accept</button>
      </div>
    );
  }, [clearChatHistory]);
  
  // Listen for AI responses to disable text entry
  useEffect(() => {
    if (aiResponseReceived) {
      setEnableTextEntry(false);
    }
  }, [aiResponseReceived]);
  
  return (
    <VZCodeProvider
      enableAIChatTextEntry={enableTextEntry}
      clearChatHistory={clearChatHistory}
      additionalWidgets={additionalWidgets}
      {/* other props */}
    >
      {children}
    </VZCodeProvider>
  );
}
```

## Workflow Sequence

1. User sends an AI request
2. AI responds with code edits
3. Parent app sets `enableAIChatTextEntry={false}` to disable input
4. Parent app renders "Accept", "Undo", and "Try Harder" buttons via `additionalWidgets`
5. User clicks "Accept" button
6. Parent app's Accept handler:
   - Calls `clearChatHistory()` to clear messages
   - Sets `enableAIChatTextEntry={true}` to re-enable input
7. User can now type a new message

## Files Modified

- `src/client/VZCodeContext/types.ts`: Added `enableAIChatTextEntry` and `clearChatHistory` to context types
- `src/client/VZCodeContext/useVZCodeState.ts`: Added parameters to context state
- `src/client/VZSidebar/AIChat/ChatInput.tsx`: Added `disabled` prop based on `enableTextEntry`
- `src/client/VZSidebar/AIChat/index.tsx`: Pass `enableAIChatTextEntry` to ChatInput
