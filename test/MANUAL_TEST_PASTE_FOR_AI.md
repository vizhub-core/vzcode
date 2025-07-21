# Manual Test Instructions for Paste for AI Functionality

This document provides instructions for manually testing the "Paste for AI" functionality in VZCode.

## Prerequisites

1. Start the VZCode development server:
   ```bash
   npm run dev
   ```

2. Open the application in a web browser (typically http://localhost:5173)

3. Create at least one file in the project so the AI buttons appear in the sidebar

## Test Cases

### Test Case 1: Basic Paste Functionality

1. **Prepare test content**: Copy the following markdown to your clipboard:

```markdown
**index.js**

```javascript
console.log('Hello from AI!');
function greet(name) {
  return `Hello, ${name}!`;
}
function add(a, b) {
  return a + b;
}
```

**styles.css**

```css
body {
  background-color: #f0f0f0;
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}
```
```

2. **Execute test**: Click the "Paste for AI" button in the VZCode sidebar
3. **Expected result**: 
   - The existing `index.js` file should be updated with the new content
   - A new `styles.css` file should be created
   - Success message should appear briefly
   - No errors in browser console

### Test Case 2: Create New Files Only

1. **Prepare test content**: Copy the following to your clipboard:

```markdown
**new-component.jsx**

```jsx
import React from 'react';

export const NewComponent = ({ title }) => {
  return (
    <div className="new-component">
      <h2>{title}</h2>
      <p>This is a new component created by AI!</p>
    </div>
  );
};
```

**config.json**

```json
{
  "name": "ai-generated-config",
  "version": "1.0.0",
  "description": "Configuration file created by AI",
  "features": ["ai-paste", "file-creation"]
}
```
```

2. **Execute test**: Click "Paste for AI"
3. **Expected result**: Two new files should be created with the specified content

### Test Case 3: Error Handling - Empty Clipboard

1. **Prepare test**: Clear your clipboard or copy empty text
2. **Execute test**: Click "Paste for AI"
3. **Expected result**: Error message "Empty clipboard" should appear briefly

### Test Case 4: Error Handling - Invalid Format

1. **Prepare test content**: Copy the following plain text:

```
This is just plain text without any markdown file format.
It should not be recognized as files.
```

2. **Execute test**: Click "Paste for AI"
3. **Expected result**: Error message "No files found" should appear briefly

### Test Case 5: Copy for AI (Verification)

1. **Setup**: Ensure you have some files in the project
2. **Execute test**: Click "Copy for AI" button
3. **Verify**: 
   - Check clipboard content (paste into a text editor)
   - Should contain markdown-formatted files
   - Format should be similar to the test content above
   - Success message "Copied!" should appear briefly

### Test Case 6: Multiple Files with Different Extensions

1. **Prepare test content**: Copy the following:

```markdown
**App.tsx**

```typescript
import React from 'react';
import './App.css';

interface AppProps {
  title: string;
}

const App: React.FC<AppProps> = ({ title }) => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>{title}</h1>
      </header>
    </div>
  );
};

export default App;
```

**package.json**

```json
{
  "name": "my-react-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^4.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

**README.md**

```markdown
# My React App

This is a sample React application created with AI assistance.

## Features

- TypeScript support
- Modern React patterns
- Responsive design

## Getting Started

1. Install dependencies: `npm install`
2. Start the development server: `npm start`
3. Open [http://localhost:3000](http://localhost:3000)
```
```

2. **Execute test**: Click "Paste for AI"
3. **Expected result**: Three files should be created/updated with proper content

## Performance Test

### Test Case 7: Large Content

1. **Prepare**: Create or find a large code file (> 1000 lines)
2. **Format as markdown**: Create a markdown format with the large file
3. **Execute test**: Paste the content
4. **Expected result**: Should handle large content without freezing the UI

## Browser Compatibility Test

Repeat the basic tests in different browsers:
- Chrome
- Firefox
- Safari
- Edge

## Console Verification

Throughout testing, check the browser console for:
- No JavaScript errors
- Appropriate debug logs
- Proper error handling messages

## Cleanup

After testing, you can:
1. Delete test files that were created
2. Restore original file content if needed
3. Clear the browser console

## Troubleshooting

If tests fail:

1. **Check browser permissions**: Some browsers require user interaction for clipboard access
2. **Verify file format**: Ensure markdown follows the expected format with `**filename**` and code blocks
3. **Check console errors**: Look for specific error messages
4. **Refresh page**: Try refreshing and testing again
5. **Check network tab**: Ensure no network requests are failing

## Expected Behavior Summary

✅ **Should work:**
- Updating existing files
- Creating new files
- Handling multiple files
- Showing success/error feedback
- Working with various file types
- Preserving file properties

❌ **Should handle gracefully:**
- Empty clipboard
- Invalid markdown format
- Network errors
- Missing permissions
- Large content
- Special characters in filenames

## Reporting Issues

If you find any issues during manual testing:

1. Note the browser and version
2. Describe the steps to reproduce
3. Include any console error messages
4. Note the expected vs actual behavior
5. Include the test content that caused the issue