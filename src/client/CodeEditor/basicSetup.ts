// Customized "basic setup" for CodeMirror.
// Mainly customized to remove keymaps, for compatibility with
// codemirror-vscode-keymap.
//
// Inspired by
// https://github.com/codemirror/basic-setup/blob/main/src/codemirror.ts
// https://github.com/replit/codemirror-vscode-keymap/blob/master/dev/basicSetupNoKeymap.ts
import {
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  lineNumbers,
  highlightActiveLineGutter,
} from '@codemirror/view';
import { Extension, EditorState } from '@codemirror/state';
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
} from '@codemirror/language';
import { history } from '@codemirror/commands';
import { highlightSelectionMatches } from '@codemirror/search';
import {
  autocompletion,
  closeBrackets,
} from '@codemirror/autocomplete';

export const basicSetup: Extension = (() => [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),

  // Not really a fan of foldGutter.
  // Unclear if it's really useful.
  // If we ever want to use it, we should
  // make sure the styling is decent.
  //   foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, {
    fallback: true,
  }),
  bracketMatching(),
  closeBrackets(),
  // We set this to `false` because that is prescribed by
  // https://github.com/replit/codemirror-vscode-keymap
  autocompletion({ defaultKeymap: false }),

  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),

  // All of these keymaps are disabled because we use
  // codemirror-vscode-keymap, which provides its own
  // keymaps for all of these things.
  //   keymap.of([
  //     ...closeBracketsKeymap,
  //     ...defaultKeymap,
  //     ...searchKeymap,
  //     ...historyKeymap,
  //     // ...foldKeymap,
  //     ...completionKeymap,
  //     ...lintKeymap,
  //   ]),
])();
