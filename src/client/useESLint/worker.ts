import * as eslint from 'eslint-linter-browserify';
import globals from 'globals';

const linter = new eslint.Linter();

// Helper function to trim keys of an object
function trimGlobalKeys(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  const newObj: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key.trim()] = obj[key];
    }
  }
  return newObj;
}

// Define the configuration without explicit types that don't exist
const config = {
  languageOptions: {
    globals: {
      ...trimGlobalKeys(globals.browser), // Apply trimming to browser globals
      ...globals.es2021, // Assuming es2021 globals are fine, or trim them too if needed
    },
    parserOptions: {
      ecmaVersion: 2022, // Use number instead of enum type
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

  // Only lint .js or .jsx files
  if (!fileName || !/\.(js|jsx)$/i.test(fileName)) {
    self.postMessage({ diagnostics: [], requestId });
    return;
  }

  try {
    // Use as any to bypass type checking for the config if necessary,
    // but the config should be valid after trimming keys.
    const messages = linter.verify(code, config as any, {
      filename: 'file.js',
    });
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
