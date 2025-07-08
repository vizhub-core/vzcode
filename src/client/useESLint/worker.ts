import * as eslint from 'eslint-linter-browserify';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react'

/* commented out in case we want to revert back to it */
/*
const linter = new eslint.Linter();

const config = {
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.es2021,
    },
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: {
        // Add this to enable JSX parsing
        jsx: true,
      },
    },
  },

  // disables all warnings when plugins are present
  plugins: {
    react: reactPlugin,
  },
  settings: {
    react: {
      version: '18.2.0'
    }
  },
  
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
    'semi': 'off',

    //adding react-specific rules
    'react/jsx-uses-vars': 'error', 
    'react/jsx-uses-react': 'error',
    'react/jsx-no-undef': 'error'

  },
};

// Helper function to convert line/column to character offset
function getOffset(
  docLines: string[],
  line: number,
  column: number,
): number {
  let offset = 0;
  for (let i = 0; i < line - 1; i++) {
    offset += (docLines[i] ? docLines[i].length : 0) + 1; // +1 for newline
  }
  return offset + column - 1;
}
*/       


/*
self.onmessage = (event) => {
  const { code, requestId, fileName } = event.data;
  if (typeof code !== 'string') {
    self.postMessage({
      diagnostics: [],
      requestId,
      error: 'Invalid code received',
    });
    return;
  }

  // Only lint .js or .jsx files
  if (!fileName || !/\.(js|jsx)$/i.test(fileName)) {
    self.postMessage({ diagnostics: [], requestId });
    return;
  }

  try {
    const messages = linter.verify(code, config as any);
    const docLines = code.split('\n');

    const diagnostics = messages.map((msg) => {
      const from = getOffset(
        docLines,
        msg.line,
        msg.column,
      );
      // endLine and endColumn may not always exist
      const to =
        msg.endLine && msg.endColumn
          ? getOffset(docLines, msg.endLine, msg.endColumn)
          : from +
            (msg.fix?.range[1] - msg.fix?.range[0] || 1);

      return {
        from,
        to,
        severity:
          msg.severity === 2
            ? 'error'
            : msg.severity === 1
              ? 'warning'
              : 'info',
        message: msg.message,
        source: msg.ruleId
          ? `eslint(${msg.ruleId})`
          : 'eslint',
      };
    });
    self.postMessage({ diagnostics, requestId });
  } catch (e: any) {
    console.error('Error linting in ESLint worker:', e);
    self.postMessage({
      error: e.message,
      diagnostics: [],
      requestId,
    });
  }
  
};
*/

self.onmessage = async (event) => {
  const { code, requestId, fileName } = event.data;

  if (typeof code !== 'string') {
    self.postMessage({
      diagnostics: [],
      requestId,
      error: 'Invalid code received',
    });
    return;
  }

  // Only lint .js or .jsx files
  if (!fileName || !/\.(js|jsx)$/i.test(fileName)) {
    self.postMessage({ diagnostics: [], requestId });
    return;
  }

  try {
    const response = await fetch("/lint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    });

    const messages = await response.json();
    const docLines = code.split('\n');

    if(!Array.isArray(messages)){
      throw new Error(messages?.error || "Unexpected response format");
    }


    const diagnostics = messages.map((msg) => {
      const getOffset = (line: number, column: number) => {
        let offset = 0;
        for (let i = 0; i < line - 1; i++) {
          offset += (docLines[i] ? docLines[i].length : 0) + 1;
        }
        return offset + column - 1;
      };

      const from = getOffset(msg.line, msg.column);
      const to = msg.endLine && msg.endColumn
        ? getOffset(msg.endLine, msg.endColumn)
        : from + (msg.endColumn ? msg.endColumn : 1);

      return {
        from,
        to,
        severity: msg.severity === 2 ? 'error' : msg.severity === 1 ? 'warning' : 'info',
        message: msg.message,
        source: msg.ruleId ? `eslint(${msg.ruleId})` : 'eslint',
      };
    });

    self.postMessage({ diagnostics, requestId });

  } catch (error: any) {
    console.error('[ESLint Worker] Error:', error);
    self.postMessage({
      error: error.message,
      diagnostics: [],
      requestId,
    });
  }
};
