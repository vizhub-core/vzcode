# Refactoring Plan: LLM Streaming UI Migration

This document outlines the plan to decouple the `llm-streaming-ui` library from the VZCode client codebase, making it a standalone, reusable component library.

## High Priority: Decouple Context

The primary goal is to remove the dependency on `VZCodeContext` from `src/llm-streaming-ui`. Components should receive data and callbacks via props.

### Phase 1: Create Wrapper Component in Client

**Goal:** Create a bridge between VZCode's context and the UI library.

1.  Create `src/client/VZSidebar/AIChatWrapper.tsx`.
2.  This component will consume `VZCodeContext`.
3.  It will render `AIChat` from `llm-streaming-ui`, passing all necessary context values as props.
4.  Update `src/client/VZSidebar/index.tsx` to use `AIChatWrapper` instead of `AIChat`.

### Phase 2: Refactor AIChat Component

**Goal:** Remove `useContext(VZCodeContext)` from `src/llm-streaming-ui/components/index.tsx`.

1.  Update `AIChat` props interface to include all values currently destructured from `VZCodeContext`.
2.  Remove the context import.
3.  Pass these props down to child components (`MessageList`, `ChatInput`) which also currently consume context.

### Phase 3: Refactor Child Components

**Goal:** Remove context usage from `MessageList`, `Message`, and `ChatInput`.

1.  **MessageList**: Update to accept `additionalWidgets` and `handleSendMessage` as props.
2.  **Message**: Update to accept `additionalWidgets` and `handleSendMessage` as props.
3.  **ChatInput**: Ensure it receives all necessary callbacks (it seems it already receives most via props from AIChat, but check for any hidden context usage).

## Medium Priority: Decouple Utilities and Hooks

The library currently imports utilities and hooks from the client folder.

### Phase 4: Migrate Hooks

**Goal:** Move or duplicate necessary hooks into the library.

1.  **useAutoScroll**: This hook is used in `AIChat`. Move `src/client/hooks/useAutoScroll.ts` to `src/llm-streaming-ui/hooks/useAutoScroll.ts` (or shared location).
2.  Update imports in `AIChat`.

### Phase 5: Migrate Utils

**Goal:** Decouple file diffing and formatting utilities.

1.  **fileDiff**: `src/utils/fileDiff.ts` is imported by `DiffView` and `IndividualFileDiff`. Move relevant diffing logic to `src/llm-streaming-ui/utils/` or ensure it's passed as a prop/utility function if it depends on specific data structures not owned by the UI.
2.  **featureFlags**: `enableDiffView`, `enableAskMode`, `enableMinimalEditFlow` are imported from `../../client/featureFlags`. These should be passed as props (booleans) to `AIChat`.

## Low Priority: Decouple UI Assets

The library depends on specific icons and bootstrap components.

### Phase 6: Abstract Icons

**Goal:** Remove hard dependency on `src/client/Icons`.

1.  Define an `Icons` interface in `llm-streaming-ui`.
2.  Accept an `icons` prop in `AIChat` (or use a Context within the library for theming).
3.  Pass VZCode icons from the wrapper.

### Phase 7: Abstract UI Components

**Goal:** Remove hard dependency on `src/client/bootstrap`.

1.  The library uses `Form`, `Button`, etc.
2.  Either bundle these styles/components with the library or define a slot/render prop API for them.
3.  For now, copying the necessary styles or components into `llm-streaming-ui` might be the easiest path to standalone usage.

## Cleanup

### Phase 8: Remove Legacy Code

**Goal:** Clean up `src/client/VZSidebar/AIChat`.

1.  Once `llm-streaming-ui` is fully working and decoupled, verify that `src/client/VZSidebar/AIChat` (the old implementation) is no longer used.
2.  Delete `src/client/VZSidebar/AIChat`.
