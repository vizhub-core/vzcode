// Inspired by https://github.com/uiwjs/react-codemirror/blob/master/themes/vscode/src/index.ts

/**
 * https://github.com/uiwjs/react-codemirror/issues/409
 */
import { tags as t } from '@lezer/highlight';
import {
  createTheme,
  CreateThemeOptions,
} from '@uiw/codemirror-themes';

// TODO replace hex codes below with these variables,
// each of which is a string containing a hex code.
import {
  backgroundColor,
  lineHighlight,
  light,
  dark,
  lineNumbers,
  lineNumbersActive,
  selectionBackground,
  selectionBackgroundMatch,
  caretColor,
  highlightColors,
} from './colors';

const MINT = highlightColors[0];
const AQUA = highlightColors[1];
const SKY = highlightColors[2];
const LAVENDER = highlightColors[3];
const SALMON = highlightColors[4];
const GOLDENROD = highlightColors[5];
const PANIC = '#ff2222';

const defaultSettingsVizhubTheme: CreateThemeOptions['settings'] =
  {
    background: backgroundColor,
    foreground: light,
    caret: caretColor,
    selection: selectionBackground,
    selectionMatch: selectionBackgroundMatch,
    lineHighlight,
    gutterBackground: backgroundColor,
    gutterForeground: lineNumbers,
    gutterActiveForeground: lineNumbersActive,
  };

function vizhubThemeInit(
  options?: Partial<CreateThemeOptions>,
) {
  const {
    theme = 'dark',
    settings = {},
    styles = [],
  } = options || {};
  return createTheme({
    theme: theme,
    settings: {
      ...defaultSettingsVizhubTheme,
      ...settings,
    },
    styles: [
      {
        tag: [
          t.keyword,
          t.operatorKeyword,
          t.modifier,
          t.color,
          t.constant(t.name),
          t.standard(t.name),
          t.standard(t.tagName),
          t.special(t.brace),
          t.atom,
          t.bool,
          t.special(t.variableName),
        ],
        color: MINT,
      },
      {
        tag: [t.controlKeyword, t.moduleKeyword],
        color: MINT,
      },
      {
        tag: [
          t.name,
          t.deleted,
          t.character,
          t.macroName,

          t.variableName,
          t.labelName,
          t.definition(t.name),
        ],
        color: AQUA,
      },
      {
        tag: [t.propertyName],
        color: GOLDENROD,
      },
      {
        tag: t.heading,
        fontWeight: 'bold',
        color: SKY,
      },
      {
        tag: [
          t.typeName,
          t.className,
          t.tagName,
          t.number,
          t.changed,
          t.annotation,
          t.self,
          t.namespace,
        ],
        color: AQUA,
      },
      {
        tag: [
          t.function(t.variableName),
          t.function(t.propertyName),
        ],
        color: AQUA,
      },
      { tag: [t.number], color: SALMON },
      {
        tag: [
          t.operator,
          t.punctuation,
          t.separator,
          t.url,
          t.escape,
          t.regexp,
        ],
        color: light,
      },
      {
        tag: [t.regexp],
        color: LAVENDER,
      },
      {
        tag: [t.special(t.string), t.string, t.inserted],
        color: LAVENDER,
      },
      {
        tag: [t.processingInstruction],
        color: AQUA,
      },
      { tag: [t.angleBracket], color: AQUA },
      { tag: t.strong, fontWeight: 'bold' },
      { tag: t.emphasis, fontStyle: 'italic' },
      {
        tag: t.strikethrough,
        textDecoration: 'line-through',
      },
      { tag: [t.meta, t.comment], color: dark },
      {
        tag: t.link,
        color: GOLDENROD,
        textDecoration: 'underline',
      },
      { tag: t.invalid, color: PANIC },
      ...styles,
    ],
  });
}

export const vizhubTheme = vizhubThemeInit();
