# Minimal AI UX Implementation Plan

This document outlines a detailed implementation plan for creating a minimal AI UX that focuses on status updates and diff-first review, rather than streaming chat messages. The plan is divided into phases that can be worked on as separate PRs.

## Overview

Current VZCode AI system streams markdown responses to a chat interface. The minimal AI UX will:
- Replace streaming chat with concise file editing status
- Auto-scroll to diff view starting point (topmost point) upon completion
- Clear chat history on Accept
- Show structured diff summary _only_, no prose
- Handle errors gracefully in the minimal flow

## Phase 0 — Feature Flag Infrastructure

**Goal:** Add feature flag system for "Minimal Edit Flow" to safely test new UX

### Files to Change

**`src/client/featureFlags.ts`**
- Add `enableMinimalEditFlow` constant
- Default to `false` for safe rollout

**`src/client/VZCodeContext/types.ts`** (or create if doesn't exist)
- Add `minimalEditFlow` to context type definitions

**`src/client/VZCodeContext/index.tsx`**
- Add state for `minimalEditFlow` feature flag
- Add toggle function for development/testing

### Implementation Details

```typescript
// src/client/featureFlags.ts
export const enableMinimalEditFlow = false; // Start disabled

// Future: Can be made configurable via workspace settings
// export const enableMinimalEditFlow = 
//   localStorage.getItem('vzcode.ai.minimalEditFlow') === 'true';
```

### Acceptance Criteria
- Flag exists and can be toggled (initially hardcoded)
- No change to existing behavior when flag is `false`
- Ready for Phase 1 implementation when flag is `true`

---

## Phase 1 — Status-Based Generation UI

**Labels:** `feat`, `ai-editing`, `ui/ux`  
**Goal:** Replace streaming chat with file editing status during generation

### Files to Create

**`src/client/VZSidebar/AIChat/AIEditStatus.tsx`**
- Component to display live file editing status
- Show "Editing `filename.js`...", "Creating `newfile.css`..." 
- Replace streaming message content when minimal flow enabled

**`src/client/VZSidebar/AIChat/AIEditStatus.scss`**
- Styling for status list component
- Clean, minimal design matching VZCode aesthetic

### Files to Modify

**`src/client/VZSidebar/AIChat/index.tsx`**
- Add conditional rendering based on `enableMinimalEditFlow` flag
- Show `AIEditStatus` instead of `MessageList` during generation
- Import and use new status component

**`src/client/VZSidebar/AIChat/MessageList.tsx`**
- Wrap with feature flag check
- Maintain existing behavior when minimal flow disabled

**`src/server/aiChatHandler/llmStreaming.ts`**
- Enhance status updates sent via `updateAIStatus`
- Emit structured status events: `{type: 'fileStart', filename, operation}`
- Send operation types: 'editing', 'creating', 'renaming', 'deleting'

**`src/client/vzReducer/aiChatReducer.ts`**
- Add handling for structured AI status updates
- Store file operation status in state
- Support status list instead of just single status string

### Implementation Details

```typescript
// AIEditStatus.tsx structure
interface FileStatus {
  filename: string;
  operation: 'editing' | 'creating' | 'renaming' | 'deleting';
  status: 'in-progress' | 'completed' | 'error';
}

interface AIEditStatusProps {
  fileStatuses: FileStatus[];
  isGenerating: boolean;
}
```

### Acceptance Criteria
- When minimal flow enabled, no streaming prose appears during generation
- Status list updates in real-time as AI processes files  
- Shows spinner and "Editing filename..." messages
- "Ready to review changes" message when generation completes
- No auto-scroll during generation (saves current scroll position)

---

## Phase 2 — Diff-First Review Experience

**Labels:** `feat`, `ai-editing`, `ui/ux`, `a11y`  
**Goal:** Auto-scroll to diff view and focus for immediate review

### Files to Modify

**`src/client/VZSidebar/AIChat/DiffView.tsx`**
- Add `scrollToFirstHunk()` method
- Add ref forwarding for scroll targeting
- Ensure proper heading structure for accessibility
- Add `tabIndex={-1}` for keyboard focus

**`src/client/VZSidebar/AIChat/index.tsx`**
- Add auto-scroll behavior on generation completion
- Trigger scroll to diff when status changes from 'generating' to 'done'
- Set keyboard focus on diff container

**`src/client/utils/scrollUtils.ts`** (create new file)
- `getFirstDiffAnchor()` utility function
- `scrollToElementWithOffset()` for header-aware scrolling
- Handle edge cases (no diff, multiple files)

### Implementation Details

```typescript
// scrollUtils.ts
export const scrollToFirstDiff = (diffContainer: HTMLElement) => {
  const firstHunk = diffContainer.querySelector('.d2h-diff-tbody tr');
  if (firstHunk) {
    const headerOffset = 60; // Account for fixed headers
    firstHunk.scrollIntoView({ block: 'start' });
    window.scrollBy(0, -headerOffset);
    
    // Set focus for keyboard navigation
    if (diffContainer.setAttribute) {
      diffContainer.tabIndex = -1;
      diffContainer.focus();
    }
  }
};
```

This should replace all existing auto-scroll logic, so let's disable all the existing auto-scrolling if the feature flag is enabled.

### Acceptance Criteria
- After generation completes, viewport automatically scrolls to first diff hunk
- Scroll accounts for fixed headers and navigation
- Keyboard focus is set on diff container for screen readers
- Works with single-file, multi-file, and zero-change scenarios
- Announces diff summary for accessibility

---

## Phase 3 — Chat History Management

**Labels:** `feat`, `ai-editing`, `product-decision`  
**Goal:** Clear chat history on Accept since history isn't used downstream

### Files to Modify

**`src/client/VZCodeContext/index.tsx`**
- Add `clearChatHistory()` function to context
- Hook into existing Accept action to trigger clearing

**`src/client/vzReducer/aiChatReducer.ts`**
- Add `CLEAR_CHAT_HISTORY` action type
- Implement reducer logic to clear messages and state
- Preserve current chat structure but remove messages

**`src/client/VZSidebar/AIChat/DiffView.tsx`**
- Add Accept button handler to trigger history clearing
- Show discrete toast notification: "Applied and cleared session history"

### Implementation Details

```typescript
// aiChatReducer.ts
case 'CLEAR_CHAT_HISTORY':
  return {
    ...state,
    chats: {
      ...state.chats,
      [action.chatId]: {
        ...state.chats[action.chatId],
        messages: [],
        aiStatus: undefined,
        aiScratchpad: undefined,
      }
    }
  };
```

### Acceptance Criteria
- On Accept, all chat messages are cleared for current session
- Reject and "Try Harder" preserve history for retry context
- Toast notification confirms history clearing
- Editor undo/redo history remains unaffected
- New edit request shows fresh, empty state

---

## Phase 4 — Structured Diff Summary

**Labels:** `feat`, `ui/ux`  
**Goal:** Replace prose file lists with structured diff summary

### Files to Create

**`src/client/VZSidebar/AIChat/DiffSummary.tsx`**
- Compact summary: "3 files modified • 1 created • 0 deleted"
- Collapsible file tree with operation badges (M, A, D, R)
- Click handlers to jump to specific file's diff section

**`src/client/VZSidebar/AIChat/DiffSummary.scss`**
- Styling for summary bar and file tree
- Badge styling consistent with existing VZCode design

### Files to Modify

**`src/client/VZSidebar/AIChat/DiffView.tsx`**
- Integrate `DiffSummary` component above diff content
- Pass diff statistics and file list as props
- Add jump-to-file functionality

**`src/client/utils/diffUtils.ts`** (create new file)
- `calculateDiffStats()` function
- `getFileOperationType()` helper
- Parse unified diff data for summary display

### Implementation Details

```typescript
// DiffSummary.tsx
interface DiffSummaryProps {
  diffData: UnifiedFilesDiff;
  onFileJump: (filename: string) => void;
}

interface DiffStats {
  modified: number;
  added: number;
  deleted: number;
  renamed: number;
}
```

### Acceptance Criteria
- No LLM prose enumeration of files
- Accurate counts for each operation type
- Interactive file list with jump-to-diff functionality
- Collapsible/expandable file tree
- Consistent with existing VZCode visual design

---

## Phase 5 — Error Handling & Edge Cases

**Labels:** `bug`, `resilience`, `ai-editing`  
**Goal:** Robust error states for minimal flow

### Files to Create

**`src/client/VZSidebar/AIChat/AIErrorCard.tsx`**
- Unified error component for timeout, parser errors, cancellation
- Action buttons: Retry, Copy Logs (dev mode)
- Optional "Show raw stream" expand for debugging

### Files to Modify

**`src/client/VZSidebar/AIChat/index.tsx`**
- Add error boundary for minimal edit flow
- Handle timeout, partial diff, and cancellation states
- Prevent auto-scroll on error conditions

**`src/server/aiChatHandler/errorHandling.ts`**
- Add error classification for minimal flow
- Structured error responses with retry suggestions
- Preserve partial diffs on timeout/cancellation

**`src/client/utils/aiErrorUtils.ts`** (create new file)
- Error categorization and user-friendly messages
- Retry logic and exponential backoff
- Development mode debugging helpers

### Implementation Details

```typescript
// AIErrorCard.tsx
interface AIErrorProps {
  errorType: 'timeout' | 'parser' | 'network' | 'partial';
  message: string;
  canRetry: boolean;
  showDebugInfo?: boolean;
  onRetry: () => void;
  onCopyLogs?: () => void;
}
```

### Acceptance Criteria
- Clear error messages with actionable next steps
- Timeout shows partial diff with retry option
- Cancellation preserves session state appropriately
- Parser errors fall back gracefully (no broken UI)
- Development debugging tools don't appear in production

---

## Phase 6 — Implementation Cleanup

**Labels:** `chore`, `cleanup`, `docs`  
**Goal:** Clean up feature flag and update documentation

### Files to Modify

**`src/client/featureFlags.ts`**
- Set `enableMinimalEditFlow = true` by default after testing
- Add deprecation plan for legacy chat streaming

**`README.md`**
- Update AI editing documentation
- Document new minimal UX flow
- Add troubleshooting section

**`CONTRIBUTING.md`**
- Add guidelines for AI UX development
- Document feature flag patterns
- Testing procedures for AI changes

### Files to Create

**`docs/ai-editing-flow.md`**
- Architecture documentation for AI editing system
- Diagram of minimal flow vs legacy flow
- API documentation for status events

### Implementation Details

- Mark legacy streaming components with `// TODO: Remove after minimal flow GA`
- Update JSDoc comments for new AI components
- Add inline documentation for complex logic

### Acceptance Criteria
- Documentation reflects current (minimal) UX
- Legacy code paths clearly marked for future removal
- Contributing guidelines updated for AI development
- Architecture diagrams show new flow

---

## Technical Implementation Notes

### Event Flow Architecture

```typescript
// Streaming events emitted by server
type AiEditEvent =
  | { type: 'fileStart'; filename: string; operation: 'create'|'modify'|'rename'|'delete'; renameFrom?: string }
  | { type: 'fileProgress'; filename: string; progress?: number }
  | { type: 'fileEnd'; filename: string; success: boolean }
  | { type: 'error'; code: 'timeout'|'parser'|'abort'; message?: string }
  | { type: 'done' };

// Client-side phase management
type AiPhase = 'idle' | 'generating' | 'readyToReview' | 'error';
```

### Key Components

1. **`AIEditStatus`** - Replaces MessageList during generation (Phase 1)
2. **`DiffSummary`** - Structured file overview above diff (Phase 4)  
3. **`AIErrorCard`** - Unified error handling (Phase 5)
4. **Enhanced `DiffView`** - Auto-scroll and accessibility (Phase 2)

### Auto-scroll Implementation

```typescript
// scrollUtils.ts
export const scrollToFirstDiff = (container: HTMLElement) => {
  const firstHunk = container.querySelector('.d2h-diff-tbody tr:first-child');
  if (firstHunk) {
    const headerOffset = document.querySelector('#appHeader')?.offsetHeight ?? 60;
    firstHunk.scrollIntoView({ block: 'start', behavior: 'smooth' });
    window.scrollBy(0, -headerOffset);
  }
};
```

### Feature Flag Integration

```typescript
// VZCodeContext usage
const { enableMinimalEditFlow } = useContext(VZCodeContext);

// Conditional rendering
{enableMinimalEditFlow ? (
  <AIEditStatus fileStatuses={aiFileStatuses} isGenerating={isLoading} />
) : (
  <MessageList messages={messages} isLoading={isLoading} />
)}
```

## Accessibility Considerations

- Status updates use `aria-live="polite"` for screen reader announcements
- Diff container receives focus with proper `tabIndex` management  
- Keyboard navigation between file hunks using arrow keys
- Error states provide clear messaging and recovery options
- Color-blind accessible diff highlighting (existing in diff2html)

## Testing Strategy

### Unit Tests
- `AIEditStatus.test.tsx` - Status list rendering and updates
- `DiffSummary.test.tsx` - Statistics calculation and file jumping
- `scrollUtils.test.ts` - Auto-scroll behavior and edge cases
- `aiErrorUtils.test.ts` - Error categorization and messages

### Integration Tests  
- Minimal flow end-to-end: generation → status → diff → accept
- Feature flag toggling preserves functionality
- Error recovery and retry behavior
- Multi-file editing scenarios

### Manual Testing Scenarios
- Single file edit, multi-file edit, file creation/deletion
- Timeout and cancellation during generation
- Accept clears history, Reject preserves context
- Auto-scroll positioning with various screen sizes
- Keyboard navigation through diff content

## Rollout Plan

1. **Phase 0**: Feature flag infrastructure (default `false`)
2. **Phases 1-2**: Core minimal UX behind flag 
3. **Phase 3**: History management and polish
4. **Phases 4-5**: Enhanced diff summary and error handling
5. **Beta testing**: Enable flag for internal team testing
6. **Gradual rollout**: Enable for subset of users with telemetry
7. **Phase 6**: Default `true`, deprecate legacy paths
8. **Future**: Remove feature flag and legacy streaming code

## Telemetry & Metrics

- `ai.minimalFlow.enabled` - Flag state on session start
- `ai.status.fileOperation` - File-level operation tracking  
- `ai.diff.autoScroll.success` - Auto-scroll positioning success
- `ai.error.[type]` - Error categorization and frequency
- `ai.session.clearedOnAccept` - History clearing behavior
- `ai.timeToFirstDiff` - Performance metric for minimal flow

This plan provides a roadmap for implementing the minimal AI UX while maintaining backward compatibility and allowing for safe, incremental rollout.
