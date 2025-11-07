# LLM Streaming UI

Client-side React UI components for displaying streaming AI edits and chat.

## Overview

This module is being extracted from VZCode's AI chat interface to become a standalone, reusable React component library. It provides client-side UI functionality for:

- **AI Chat Interface**: Main chat container component
- **Message Display**: Rendering user and AI messages with streaming support
- **Diff Visualization**: Showing code changes with syntax highlighting
- **Status Indicators**: Displaying AI thinking/reasoning and file editing status
- **Voice Input**: Speech recognition for voice-based chat input

## Current Status

⚠️ **Work in Progress**: This is Phase 1 of the extraction plan. The files have been copied to this directory and imports have been updated, but the components are not yet decoupled from VZCode.

## Components

### Main Components

- `index.tsx` (AIChat) - Main chat container with message management
- `MessageList.tsx` - Scrollable message list with auto-scroll
- `Message.tsx` - Individual message rendering (user/assistant)
- `ChatInput.tsx` - Chat input field with voice support

### Diff/Code Display

- `DiffView.tsx` - Unified diff viewer for code changes
- `IndividualFileDiff.tsx` - Per-file diff display
- `FileEditingIndicator.tsx` - Status indicator for file editing

### Status/Loading

- `TypingIndicator.tsx` - Animated typing/loading indicator
- `ThinkingScratchpad.tsx` - AI reasoning/thinking display
- `JumpToLatestButton.tsx` - Button to scroll to latest message

### Hooks

- `useSpeechRecognition.ts` - Voice input functionality

### Styles

- `styles.scss` - Main component styles
- `DiffView.scss` - Diff viewer styles

## Dependencies

Currently depends on:

- React and React hooks
- VZCode context: `../../client/VZCodeContext`
- VZCode types: `../../types.js`
- VZCode utilities: `../../client/hooks/*`, `../../utils/*`
- Bootstrap components
- diff2html for diff rendering
- react-markdown for message rendering

## Future Plans

This module will eventually be:

1. Decoupled from VZCode-specific context and utilities
2. Published as `@vizhub/llm-streaming-ui` on npm
3. Made themeable and customizable
4. Provided with Storybook documentation
5. Fully typed with exported TypeScript interfaces

See the [main issue](https://github.com/vizhub-core/vzcode/issues/XXX) for the full extraction plan.

## Usage (Current)

Currently, this module is imported by `src/client/VZSidebar/index.tsx`:

```typescript
import { AIChat } from '../../llm-streaming-ui/components/index.js';
```

The AIChat component expects VZCode context to be available and receives props like:

- Chat state from VZCodeContext
- Message sending handlers
- Auto-scroll configuration

## Contributing

As this module is being extracted, please:

- Keep changes minimal and focused
- Maintain backward compatibility with VZCode
- Update component tests when modifying functionality
- Consider future consumers when adding new dependencies
- Document component props and behavior

## Theming

The components currently use VZCode's theming system via SCSS variables. Future versions will provide:

- CSS custom properties for theming
- Light/dark theme presets
- Customizable component styling
