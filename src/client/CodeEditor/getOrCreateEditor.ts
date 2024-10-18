import { EditorView } from 'codemirror';
import {
  Compartment,
  EditorState,
} from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { svelte } from '@replit/codemirror-lang-svelte';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json1Sync } from 'codemirror-ot';

import { autocompletion } from '@codemirror/autocomplete';
import { indentationMarkers } from '@replit/codemirror-indentation-markers';
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap';
import { Diagnostic, linter } from '@codemirror/lint';

import { json1Presence, textUnicode } from '../../ot';
import {
  FileId,
  PaneId,
  ShareDBDoc,
  TabState,
  Username,
  VZCodeContent,
} from '../../types';
import { json1PresenceBroadcast } from './json1PresenceBroadcast';
import { json1PresenceDisplay } from './json1PresenceDisplay';
import {
  colorsInTextPlugin,
  rotationIndicator,
  widgets,
} from './InteractiveWidgets';
import {
  EditorCache,
  editorCacheKey,
  EditorCacheValue,
} from '../useEditorCache';
import { ThemeLabel, themeOptionsByLabel } from '../themes';
import { typeScriptCompletions } from './typeScriptCompletions';
import { typeScriptLinter } from './typeScriptLinter';
import { keymap } from '@codemirror/view';
import { basicSetup } from './basicSetup';
import { InteractRule } from '@replit/codemirror-interact';
import rainbowBrackets from '../CodeEditor/rainbowBrackets';
import { cssLanguage } from '@codemirror/lang-css';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { copilot } from './Copilot';

// Feature flag to enable TypeScript completions & TypeScript Linter.
const enableTypeScriptLinter = true;

// Feature flag to enable AI copilot
const enableCopilot = true;

// Enables TypeScript +JSX support in CodeMirror.
const tsx = () =>
  javascript({ jsx: true, typescript: true });

const htmlConfig = {
  matchClosingTags: true,
  selfClosingTags: false,
  autoCloseTags: true,
  extraTags: {},
  extraGlobalAttributes: {},
  nestedLanguages: [
    {
      tag: 'script',
      language: javascript,
      parser: javascriptLanguage.parser,
    },
    {
      tag: 'style',
      language: css,
      parser: cssLanguage.parser,
    },
  ],
};
// Language extensions for CodeMirror.
// Keys are file extensions.
// Values are CodeMirror extensions.
const languageExtensions = {
  json,
  tsx,
  js: tsx,
  jsx: tsx,
  ts: tsx,
  html: () => html(htmlConfig),
  css,
  md: markdown,
  svelte,
};

// Gets a value at a path in an object.
const getAtPath = (obj, path) => {
  let current = obj;
  for (const key of path) {
    if (!current) return undefined;
    current = current[key];
  }
  return current;
};

// Gets or creates an editorCache entry for the given file id.
export const getOrCreateEditor = ({
  paneId = 'root',
  fileId,
  shareDBDoc,
  content,
  filesPath,
  localPresence,
  docPresence,
  theme,
  onInteract,
  editorCache,
  usernameRef,
  typeScriptWorker,
  customInteractRules,
  allowGlobals,
  enableAutoFollowRef,
  openTab,
  aiCopilotEndpoint,
  rainbowBracketsEnabled, // <-- new flag for rainbow brackets
}: {
  paneId?: PaneId;
  fileId: FileId;
  shareDBDoc: ShareDBDoc<VZCodeContent> | undefined;
  content: VZCodeContent;
  filesPath: string[];
  localPresence: any;
  docPresence: any;
  theme: ThemeLabel;
  onInteract?: () => void;
  editorCache: EditorCache;
  usernameRef: React.MutableRefObject<Username>;
  aiAssistEndpoint?: string;
  typeScriptWorker: Worker;
  customInteractRules?: Array<InteractRule>;
  allowGlobals: boolean;
  enableAutoFollowRef: React.MutableRefObject<boolean>;
  openTab: (tabState: TabState) => void;
  aiCopilotEndpoint: string;
  rainbowBracketsEnabled: boolean; // <-- added here
}): EditorCacheValue => {
  // Cache hit
  const cacheKey = editorCacheKey(fileId, paneId);

  if (editorCache.has(cacheKey)) {
    return editorCache.get(cacheKey);
  }

  // Cache miss

  // Compute text and fileExtension from the ShareDB document.
  const textPath = [...filesPath, fileId, 'text'];
  const namePath = [...filesPath, fileId, 'name'];
  const text = getAtPath(content, textPath);
  const name = getAtPath(content, namePath);
  const fileExtension = name.split('.').pop();

  // Create a compartment for the theme so that it can be changed dynamically.
  let themeCompartment = new Compartment();

  const extensions = [];

  // This plugin implements multiplayer editing.
  if (shareDBDoc) {
    extensions.push(
      json1Sync({
        shareDBDoc,
        path: textPath,
        json1: json1Presence,
        textUnicode,
      }),
    );

    // Deals with broadcasting changes in cursor location and selection.
    if (localPresence) {
      extensions.push(
        json1PresenceBroadcast({
          path: textPath,
          localPresence,
          usernameRef,
        }),
      );
    }

    // Deals with receiving the broadcast from other clients and displaying them.
    if (docPresence) {
      extensions.push(
        json1PresenceDisplay({
          path: textPath,
          docPresence,
          enableAutoFollowRef,
          openTab,
        }),
      );
    }
  } else {
    // If the ShareDB document is not provided, then we do not allow editing.
    extensions.push(EditorView.editable.of(false));
  }

  extensions.push(colorsInTextPlugin);

  extensions.push(basicSetup);

  // Dynamic changing of the theme.
  extensions.push(
    themeCompartment.of(themeOptionsByLabel[theme].value),
  );

  const languageCompartment = new Compartment();
  const getLanguageExtension = (fileExtension: string) => {
    const languageFunc = languageExtensions[fileExtension];
    return languageFunc ? languageFunc() : undefined;
  };

  const languageExtension =
    getLanguageExtension(fileExtension);
  if (languageExtension) {
    extensions.push(
      languageCompartment.of(languageExtension),
    );
  } else {
    extensions.push(languageCompartment.of([]));
  }

  extensions.push(
    widgets({ onInteract, customInteractRules }),
  );

  extensions.push(rotationIndicator);

  const isTypeScript =
    fileExtension === 'js' ||
    fileExtension === 'jsx' ||
    fileExtension === 'ts' ||
    fileExtension === 'tsx';

  extensions.push(
    autocompletion(
      isTypeScript
        ? {
            override: [
              typeScriptCompletions({
                typeScriptWorker,
                fileName: name,
              }),
            ],
          }
        : undefined,
    ),
  );

  if (shareDBDoc && enableTypeScriptLinter) {
    extensions.push(
      linter(
        typeScriptLinter({
          typeScriptWorker,
          fileName: name,
          shareDBDoc,
          fileId,
          allowGlobals,
        }) as unknown as () => Diagnostic[],
      ),
    );
  }

  extensions.push(
    indentationMarkers({
      colors: {
        light: '#4d586b',
        dark: '#4d586b',
        activeLight: '#8e949f',
        activeDark: '#8e949f',
      },
    }),
  );

  // Add the rainbow brackets plugin with the `rainbowBracketsEnabled` flag
  extensions.push(rainbowBrackets(rainbowBracketsEnabled));

  // Add copilot if enabled
  if (enableCopilot) {
    extensions.push(copilot({ aiCopilotEndpoint }));
  }

  const editor = new EditorView({
    state: EditorState.create({
      doc: text,
      extensions,
    }),
  });

  const editorCacheValue = { editor, themeCompartment };

  // Populate the cache.
  editorCache.set(cacheKey, editorCacheValue);

  return editorCacheValue;
};
