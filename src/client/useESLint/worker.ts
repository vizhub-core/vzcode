import * as eslint from 'eslint-linter-browserify';
import globals from 'globals';

// Feature flag to enable or disable JSX linting
// It's disabled for now since it doesn't work.
// See issue:
// https://github.com/vizhub-core/vzcode/issues/921
const enableJSXLinting = false;

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
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
    semi: 'off',
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

  // Only lint .js files, and .jsx files if enableJSXLinting is true
  if (!fileName) {
    self.postMessage({ diagnostics: [], requestId });
    return;
  }

  const isJsFile = /\.js$/i.test(fileName);
  const isJsxFile = /\.jsx$/i.test(fileName);

  if (!isJsFile && (!isJsxFile || !enableJSXLinting)) {
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
