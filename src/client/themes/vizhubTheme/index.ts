// A CodeMirror 6 theme for the VizHub syntax highlighting colors.

// Inspired by https://github.com/uiwjs/react-codemirror/blob/master/themes/vscode/src/index.ts

import { tags as t } from '@lezer/highlight';
import {
  createTheme,
  CreateThemeOptions,
} from '@uiw/codemirror-themes';

import {
  // Colors for various things outside the code itself
  backgroundColor,
  lineHighlight,
  light,
  dark,
  lineNumbers,
  lineNumbersActive,
  selectionBackground,
  selectionBackgroundMatch,
  caretColor,

  // Syntax highlighting colors
  MINT,
  AQUA,
  SKY,
  LAVENDER,
  SALMON,
  GOLDENROD,
  PANIC,
} from './colors';
import { EditorView } from 'codemirror';

// Use semi-bold weight for keywords and other important things
// const boldWeight = 'bold';

// This looks way better as we are pulling in the semi-bold font from Google Fonts
const boldWeight = '500';

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
  return [
    createTheme({
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
          fontWeight: boldWeight,
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
        { tag: t.strong, fontWeight: boldWeight },
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
        // {
        //   class: 'cm-nonmatchingBracket',
        //   // color: "rede",
        //   backgroundColor: 'red', // Optional: set background color for matching brackets
        // },
        // {
        //   tag: t.nonmatchingBracket,
        //   color: nonMatchingBracketColor,
        //   backgroundColor: 'transparent', // Optional: set background color for non-matching brackets
        // },
        ...styles,
      ],
    }),
    // Theme matching and non-matching brackets.
    EditorView.theme(
      {
        '&.cm-focused .cm-matchingBracket': {
          backgroundColor: 'transparent',
          outline: '1px solid #888888',
        },
        '&.cm-focused .cm-nonmatchingBracket': {
          backgroundColor: 'transparent',
          outline: '1px solid #ff2222',
        },
        '.rainbow-bracket-red > span': {
          color: 'white',
        },
        '.rainbow-bracket-orange > span': {
          // red
          color: '#FFB2B2',
        },
        '.rainbow-bracket-yellow > span': {
          // orange
          color: '#FFB2DA',
        },
        '.rainbow-bracket-green > span': {
          // yellow
          color: '#FFFFB2',
        },
        '.rainbow-bracket-blue > span': {
          // green
          color: '#B2FFB2',
        },
        '.rainbow-bracket-indigo > span': {
          // blue
          color: '#B2FFFF',
        },
        '.rainbow-bracket-violet > span': {
          // purple
          color: '#DAB2FF',
        }

      },
      { dark: true },
    ),
  ];
}

export const vizhubTheme = vizhubThemeInit();
