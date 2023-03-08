import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript, typescriptLanguage } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { json1Sync } from 'codemirror-ot';
import { json1Presence, textUnicode } from './ot';

// Singleton cache of CodeMirror instances
// These are created, but never destroyed.
// TODO consider invalidating this cache at some point.
//  * Keys are file ids
//  * Values are CodeMirror instances
const editorCache = new Map();

// Gets or creates a CodeMirror editor for the given file id.
export const getOrCreateEditor = ({ fileId, shareDBDoc, localPresence }) => {
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
    // See https://discuss.codemirror.net/t/codemirror-6-proper-way-to-listen-for-changes/2395/10
    EditorView.updateListener.of((viewUpdate) => {
      // If this update modified the cursor / selection,
      // we broadcast the selection update via ShareDB presence.
      if (viewUpdate.selectionSet) {
        // Isolate the single selection to use for presence.
        // Unfortunately JSON1 with presence does not yet
        // support multiple selections.
        // See https://github.com/ottypes/json1/pull/25#issuecomment-1459616521
        const selection = viewUpdate.state.selection.ranges[0];
        const { from, to } = selection;

        // Translate this into the form expected by json1Presence.
        const presence = { start: [...path, from], end: [...path, to] };

        // TODO broadcast this!
        console.log(presence);
      }
      console.log(viewUpdate);
    }),

    // TODO develop another plugin that deals with presence
    // See
    //  * https://github.com/share/sharedb/blob/master/examples/rich-text-presence/server.js#L9
    //  * https://github.com/yjs/y-codemirror.next/blob/main/src/y-remote-selections.js
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
