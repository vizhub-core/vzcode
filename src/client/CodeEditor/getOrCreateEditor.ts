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
// import { showMinimap } from '@replit/codemirror-minimap';
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
  nestedAttributes: [],
};
// Language extensions for CodeMirror.
// Keys are file extensions.
// Values are CodeMirror extensions.
// TODO consider moving this to a separate file.
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
// e.g. getAtPath({a: {b: 1}}, ['a', 'b']) === 1
const getAtPath = (obj, path) => {
  let current = obj;
  for (const key of path) {
    if (!current) return undefined;
    current = current[key];
  }
  return current;
};

// Gets or creates an `editorCache` entry for the given file id.
// Looks in `editorCache` first, and if not found, creates a new editor.
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
}: {
  // TODO pass this in from the outside
  paneId?: PaneId;
  fileId: FileId;

  // The ShareDB document that contains the file.
  // Used when the editor is created for:
  //  * Figuring out the initial text
  //  * Figuring out the initial language extension
  //    based on the file extension.
  // It's also passed into the `json1Sync` extension,
  // which is used for multiplayer editing.
  // This can be `undefined` in the case where we are
  // viewing files read-only, in which case multiplayer
  // editing is not enabled.
  shareDBDoc: ShareDBDoc<VZCodeContent> | undefined;

  // The initial content to present.
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

  // Ref to a boolean that determines whether to
  // enable auto-following the cursors of remote users.
  enableAutoFollowRef: React.MutableRefObject<boolean>;
  openTab: (tabState: TabState) => void;
  aiCopilotEndpoint: string;
}): EditorCacheValue => {
  // Cache hit

  const cacheKey = editorCacheKey(fileId, paneId);

  if (editorCache.has(cacheKey)) {
    return editorCache.get(cacheKey);
  }

  // Cache miss

  // Compute `text` and `fileExtension` from the ShareDB document.
  const textPath = [...filesPath, fileId, 'text'];
  const namePath = [...filesPath, fileId, 'name'];
  const text = getAtPath(content, textPath);
  const name = getAtPath(content, namePath);
  const fileExtension = name.split('.').pop();

  // Create a compartment for the theme so that it can be changed dynamically.
  // Inspired by: https://github.com/craftzdog/cm6-themes/blob/main/example/index.ts
  let themeCompartment = new Compartment();

  // The CodeMirror extensions to use.
  // const extensions = [autocompletion(), html(htmlConfig)]
  const extensions = [];

  // This plugin implements multiplayer editing,
  // real-time synchronozation of changes across clients.
  // Does not deal with showing others' cursors.
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
    // If the ShareDB document is not provided,
    // then we do not allow editing.
    extensions.push(EditorView.editable.of(false));
  }

  extensions.push(colorsInTextPlugin);

  // This is the "basic setup" for CodeMirror,
  // which actually adds a ton on functionality.
  // TODO vet this functionality, and determine how much
  // we want to replace with
  // https://github.com/vizhub-core/vzcode/issues/134
  extensions.push(basicSetup);

  // This supports dynamic changing of the theme.
  extensions.push(
    themeCompartment.of(themeOptionsByLabel[theme].value),
  );

  // TODO handle dynamic changing of the file extension.
  // TODO handle dynamic file extensions by making
  // the CodeMirror language extension dynamic
  // using a Compartment.
  const languageCompartment = new Compartment();
  // See https://github.com/vizhub-core/vzcode/issues/55
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
    // Not sure if this case even works.
    // TODO manually test this case by creating a file
    // that has no extension, opening it up,
    // and then adding an extension.
    // console.warn(
    //   `No language extension for file extension: ${fileExtension}`,
    // );
    // We still need to push the compartment,
    // otherwise the compartment won't work when
    // a file extension _is_ added later on.
    extensions.push(languageCompartment.of([]));
  }

  // Add interactive widgets.
  // Includes the Alt+drag functionality for numbers.
  // Calls `onInteract` when one of those widgets is interacted with.
  // This can be used to trigger a transition to throttled mode
  // for hot reloading.
  // TODO consider leveraging the new `dragEnd` event handler.
  // and removing the `onInteract` callback, replacing it with
  // `onInteractStart` and `onInteractEnd`.
  // That may be tricky for one-off interactions though, like
  // the boolean checkboxes. The color pickers are also tricky,
  // as they would also need to be able to handle `onInteractEnd`.
  // See https://github.com/replit/codemirror-interact/issues/14
  extensions.push(
    widgets({ onInteract, customInteractRules }),
  );

  // TODO fix the bugginess in this one where
  // the highlight persists after the mouse leaves.
  // extensions.push(highlightWidgets);

  extensions.push(rotationIndicator);

  // extensions.push(
  //   AIAssistCodeMirrorKeyMap({
  //     shareDBDoc,
  //     fileId,
  //     tabList,
  //     aiAssistEndpoint,
  //     aiAssistOptions,
  //   }),
  // );

  // Add the extension that provides TypeScript completions.
  // only add this if it's TS-compatible (.js, .jsx, .ts, .tsx)
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
        //Needs the unknown because we are returning a Promise<Diagnostic>
      ),
    );
  }

  // Add the extension that provides indentation markers.
  extensions.push(
    indentationMarkers({
      // thickness: 2,
      colors: {
        light: '#4d586b',
        dark: '#4d586b',
        activeLight: '#8e949f',
        activeDark: '#8e949f',
      },
    }),
  );

  // Show the minimap
  // See https://github.com/replit/codemirror-minimap#usage
  // This extension has poor performance, so it's disabled for now.
  // extensions.push(
  //   showMinimap.compute(['doc'], () => ({
  //     create: () => ({
  //       dom: document.createElement('div'),
  //     }),
  //     // Without this, performance is terrible.
  //     displayText: 'blocks',
  //   })),
  // );

  // VSCode keybindings
  // See https://github.com/replit/codemirror-vscode-keymap#usage
  // extensions.push(keymap.of(vscodeKeymap));
  extensions.push(
    keymap.of(
      vscodeKeymap.map((binding) => {
        // Here we override the Shift+Enter behavior specifically,
        // as that can be used to trigger a manual save/Prettier,
        // and the default behavior from the keymap interferes.
        if (binding.key === 'Enter') {
          delete binding.shift;
        }
        return binding;
      }),
    ),
  );
  // adds rainbow brackets
  extensions.push(rainbowBrackets());

  // adds copilot
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
