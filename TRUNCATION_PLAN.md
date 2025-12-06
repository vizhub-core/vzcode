# Truncation Plan: Optimize "Copy for AI" with File Truncation

## Objective

Implement file truncation logic in the "Copy for AI" feature to prevent sending unnecessarily large files to AI models, reducing token usage and improving performance.

## Current State

The "Copy for AI" feature currently copies all files in their entirety to the clipboard. For large projects with big files (e.g., long CSV files, large JSON files, or verbose code files), this results in a large amount of data being sent to AI models, consuming more tokens and potentially hitting token limits.

## Solution Overview

Reuse the existing `prepareFilesForPrompt()` function from the `editcodewithai` package (specifically `editcodewithai/src/fileUtils.ts`) which already implements smart truncation logic for the actual AI edit feature.

### Truncation Rules (from `editcodewithai`)

The function applies these truncation strategies:

1. **Skip image files entirely** - Image files are identified and excluded from the copy
2. **CSV and JSON files** - Truncate to first 50 lines
3. **All other files** - Truncate to first 500 lines
4. **Line length** - Truncate each line to 200 characters

This approach balances providing enough context for AI models while keeping data size manageable.

## Implementation Plan

### Phase 1: Add Function Import

**Location:** `src/client/VZSidebar/aiCopyPaste.ts`

Import the `prepareFilesForPrompt` function:

```typescript
import { prepareFilesForPrompt } from 'editcodewithai';
```

### Phase 2: Update handleCopyForAI Function

Modify the copy handler to use truncated files:

```typescript
const handleCopyForAI = async () => {
  if (!files || Object.keys(files).length === 0) {
    setCopyButtonText('No files to copy');
    setTimeout(
      () => setCopyButtonText('Copy for AI'),
      2000,
    );
    return;
  }

  try {
    // Step 1: Convert VizFiles to FileCollection
    const fileCollection = vizFilesToFileCollection(files);

    // Step 2: Apply truncation logic
    const { files: truncatedFiles, imageFiles } =
      prepareFilesForPrompt(files);

    // Step 3: Format truncated files for markdown
    const formattedFiles =
      formatMarkdownFiles(truncatedFiles);

    // Optional: Add metadata about truncation/skipped files
    // If there were image files, users should know they were excluded
    let finalContent = formattedFiles;
    if (imageFiles.length > 0) {
      finalContent +=
        '\n\n<!-- Image files (not included): ' +
        imageFiles.join(', ') +
        ' -->';
    }

    // Step 4: Copy to clipboard
    await navigator.clipboard.writeText(finalContent);

    setCopyButtonText('Copied!');
    setTimeout(
      () => setCopyButtonText('Copy for AI'),
      2000,
    );
  } catch (error) {
    console.error('Failed to copy files for AI:', error);
    setCopyButtonText('Error');
    setTimeout(
      () => setCopyButtonText('Copy for AI'),
      2000,
    );
  }
};
```

### Phase 3: Update Tests

Add tests to verify truncation behavior:

1. Test that large files are truncated appropriately
2. Test that CSV/JSON files have different truncation than code files
3. Test that image files are excluded
4. Test line length truncation (200 chars per line)

### Phase 4: Consider UI Feedback

Optionally, provide users with feedback about:

- **Truncation indicator:** Show if files were truncated in the button label or a tooltip
- **Information in clipboard:** Include a comment in the markdown indicating which files were truncated
- **Analytics:** Track how often truncation occurs (e.g., "Copied! (3 files truncated)")

## Benefits

- **Reduced token consumption:** Smaller payloads mean fewer tokens used
- **Improved performance:** Faster copying and processing by AI models
- **Consistent behavior:** Uses the same truncation logic as the AI edit feature
- **Smart truncation:** Different rules for different file types
- **No duplicated code:** Leverages existing tested implementation

## Dependencies

- `editcodewithai` - Already a dependency, provides `prepareFilesForPrompt`
- No new dependencies required

## Risks and Mitigations

| Risk                                                | Mitigation                                                                       |
| --------------------------------------------------- | -------------------------------------------------------------------------------- |
| Users may not be aware files are truncated          | Add visual indicator or comment in copied content                                |
| Image files silently excluded                       | Mention excluded files in comments within markdown                               |
| Line truncation at 200 chars may cut important code | This is intentional for token reduction; users can run more iterations if needed |

## Success Criteria

- [ ] "Copy for AI" uses `prepareFilesForPrompt()` function
- [ ] Large files are truncated according to the rules
- [ ] CSV/JSON files truncated to 50 lines
- [ ] Code files truncated to 500 lines
- [ ] Lines truncated to 200 characters max
- [ ] Image files are excluded
- [ ] Tests verify truncation behavior
- [ ] All existing tests pass
- [ ] No regressions in copy/paste functionality

## Testing Strategy

1. **Unit tests:** Test truncation rules with various file types and sizes
2. **Integration tests:** Verify copy/paste still works with truncated content
3. **Manual testing:** Copy a project with large files and verify:
   - Large files are truncated
   - CSV/JSON get 50-line truncation
   - Code files get 500-line truncation
   - Image files don't appear in clipboard

## Future Enhancements

- Make truncation limits configurable
- Add UI control to copy full files vs truncated
- Display truncation statistics to user
- Add option to include metadata about truncated file sizes
