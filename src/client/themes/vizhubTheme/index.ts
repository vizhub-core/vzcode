// A CodeMirror 6 theme for VizHub with extended functionality and clarity.
import { tags as t } from '@lezer/highlight';
import {
  createTheme,
  CreateThemeOptions,
} from '@uiw/codemirror-themes';

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
  MINT,
  AQUA,
  SKY,
  LAVENDER,
  SALMON,
  GOLDENROD,
  PANIC,
} from './colors';
import { EditorView } from 'codemirror';

// Default font weight for improved readability
const boldWeight = '500';

const defaultSettingsVizhubTheme: CreateThemeOptions['settings'] = {
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

// Function to initialize VizHub theme
function vizhubThemeInit(options?: Partial<CreateThemeOptions>) {
  const {
    theme = 'dark',
    settings = {},
    styles = [],
  } = options || {};
  return [
    createTheme({
      theme,
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
          fontWeight: boldWeight,
        },
        {
          tag: [t.controlKeyword, t.moduleKeyword],
          color: MINT,
          fontWeight: boldWeight,
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
          fontStyle: 'italic',
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
        // Hover effects for better UX
        {
          tag: t.string,
          class: 'hover-highlight',
          hoverColor: `${LAVENDER}`,
        },
        ...styles,
      ],
    }),
    // Theme for brackets
    EditorView.theme(
      {
        '&.cm-focused .cm-matchingBracket': {
          backgroundColor: 'transparent',
          outline: '1px solid #888888',
          transition: 'outline 0.3s ease-in-out',
        },
        '&.cm-focused .cm-nonmatchingBracket': {
          backgroundColor: 'transparent',
          outline: '1px solid #ff2222',
          transition: 'outline 0.3s ease-in-out',
        },
        '&:hover .hover-highlight': {
          color: `${AQUA}`,
          transition: 'color 0.2s ease-in-out',
        },
      },
      { dark: true },
    ),
  ];
}

export const vizhubTheme = vizhubThemeInit();
