import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { json1Sync } from 'codemirror-ot';
import { json1Presence, textUnicode } from './ot';
import { json1PresenceBroadcast } from './json1PresenceBroadcast';
import { json1PresenceDisplay } from './json1PresenceDisplay';

// Singleton cache of CodeMirror instances
// These are created, but never destroyed.
// TODO consider invalidating this cache at some point.
//  * Keys are file ids
//  * Values are CodeMirror instances
const editorCache = new Map();

// Gets or creates a CodeMirror editor for the given file id.
export const getOrCreateEditor = ({
  fileId,
  shareDBDoc,
  localPresence,
  docPresence,
  theme,
}) => {
  const data = shareDBDoc.data;

  const fileExtension = data[fileId].name.split('.').pop();

  // The path for this file in the ShareDB document.
  const path = [fileId, 'text'];

  const extensions = [
    // This plugin implements multiplayer editing,
    // real-time synchronozation of changes across clients.
    // Does not deal with showing others' cursors.
    json1Sync({
      shareDBDoc,
      path,
      json1: json1Presence,
      textUnicode,
    }),

    // Deals with broadcasting changes in cursor location and selection.
    json1PresenceBroadcast({ path, localPresence }),

    // Deals with receiving the broadcas from other clients and displaying them.
    json1PresenceDisplay({ path, docPresence }),

    basicSetup,
    oneDark,
  ];

  if (
    fileExtension === 'js' ||
    fileExtension === 'json' ||
    fileExtension == 'jsx' ||
    fileExtension == 'ts'
  ) {
    extensions.push(javascript());
  } else if (fileExtension === 'html') {
    extensions.push(html());
  } else if (fileExtension === 'css') {
    extensions.push(css());
  } else if (fileExtension === 'md') {
    extensions.push(markdown());
  }

  let editor = editorCache.get(fileId);
  if (!editor) {
    // Cache miss --> mint a new editor.
    editor = new EditorView({
      state: EditorState.create({
        doc: data[fileId].text,
        extensions,
      }),
    });

    // Populate the cache.
    editorCache.set(fileId, editor);
  }
  return editor;
};
