import { EditorView, basicSetup } from 'codemirror';
import { Compartment, EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json1Sync } from 'codemirror-ot';
import { json1Presence, textUnicode } from '../../ot';
import { FileId, ShareDBDoc } from '../../types';
import { json1PresenceBroadcast } from './json1PresenceBroadcast';
import { json1PresenceDisplay } from './json1PresenceDisplay';
import { widgets } from './widgets';

// Singleton cache of CodeMirror instances
// These are created, but never destroyed.
// TODO consider invalidating this cache at some point.
//  * Keys are file ids
//  * Values are CodeMirror instances (TODO add CodeMirror type)
const editorCache = new Map<FileId, any>();

// Gets a value at a path in an object.
// e.g. getAtPath({a: {b: 1}}, ['a', 'b']) === 1
const getAtPath = (obj, path) => {
  let current = obj;
  for (const key of path) {
    if (!current) return undefined;
    current = current[key];
  }
  return current;
};

// Gets or creates a CodeMirror editor for the given file id.
export const getOrCreateEditor = ({
  fileId,
  shareDBDoc,
  filesPath,
  localPresence,
  docPresence,
  theme,
  onInteract,
}: {
  fileId: FileId;
  shareDBDoc: ShareDBDoc<any>;
  filesPath: string[];
  localPresence: any;
  docPresence: any;
  theme: any;
  onInteract?: () => void;
}) => {
  let editor = editorCache.get(fileId);
  if (!editor) {
    const data = shareDBDoc.data;
    const textPath = [...filesPath, fileId, 'text'];
    const namePath = [...filesPath, fileId, 'name'];

    const text = getAtPath(data, textPath);
    const name = getAtPath(data, namePath);

    const fileExtension = name.split('.').pop();

    // Create a compartment for the theme so that it can be changed dynamically.
    // Inspired by: https://github.com/craftzdog/cm6-themes/blob/main/example/index.ts
    let themeCompartment = new Compartment();

    const extensions = [];

    // This plugin implements multiplayer editing,
    // real-time synchronozation of changes across clients.
    // Does not deal with showing others' cursors.
    extensions.push(
      json1Sync({
        shareDBDoc,
        path: textPath,
        json1: json1Presence,
        textUnicode,
      }),
    );

    // Deals with broadcasting changes in cursor location and selection.
    if (localPresence)
      extensions.push(
        json1PresenceBroadcast({ path: textPath, localPresence }),
      );

    // Deals with receiving the broadcas from other clients and displaying them.
    if (docPresence)
      extensions.push(json1PresenceDisplay({ path: textPath, docPresence }));

    extensions.push(basicSetup);
    extensions.push(themeCompartment.of(theme));

    // TODO handle dynamic changing of the file extension.
    if (
      fileExtension === 'js' ||
      fileExtension === 'json' ||
      fileExtension === 'jsx' ||
      fileExtension === 'ts'
    ) {
      extensions.push(javascript());
    } else if (fileExtension === 'html') {
      extensions.push(html());
    } else if (fileExtension === 'css') {
      extensions.push(css());
    } else if (fileExtension === 'md') {
      extensions.push(markdown());
    }

    extensions.push(widgets({ onInteract }));

    editor = new EditorView({
      state: EditorState.create({
        doc: text,
        extensions,
      }),
    });

    // Populate the cache.
    editorCache.set(fileId, editor);
  }
  return editor;
};
