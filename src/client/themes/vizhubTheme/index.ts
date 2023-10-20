import { tags as t } from '@lezer/highlight';
import {
  createTheme,
  CreateThemeOptions,
} from '@uiw/codemirror-themes';

import { vizhubThemeColors } from './vizhubThemeColors';

// Inspired by https://github.com/uiwjs/react-codemirror/blob/master/themes/vscode/src/index.ts
export const defaultSettingsVizhub: CreateThemeOptions['settings'] =
  {
    background: vizhubThemeColors.container.backgroundColor,
    foreground: vizhubThemeColors.default.color,
    caret: vizhubThemeColors.caretColor,
    selection: vizhubThemeColors.selectionBackground,
    selectionMatch:
      vizhubThemeColors.searching.backgroundColor,
    lineHighlight: vizhubThemeColors.selectionBackground,
    gutterBackground:
      vizhubThemeColors.gutter.backgroundColor,
    gutterForeground: vizhubThemeColors.gutter.color,
    gutterActiveForeground: vizhubThemeColors.default.color,
    // I believe we inherit font family from CSS elsewhere
    // fontFamily:
    //   'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
  };

export function vizhubThemeInit(
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
      ...defaultSettingsVizhub,
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
        color: vizhubThemeColors.keyword.color,
      },
      {
        tag: [t.controlKeyword, t.moduleKeyword],
        color: vizhubThemeColors.builtin.color,
      },
      {
        tag: [
          t.name,
          t.deleted,
          t.character,
          t.macroName,
          t.propertyName,
          t.variableName,
          t.labelName,
          t.definition(t.name),
        ],
        color: vizhubThemeColors.variable.color,
      },
      {
        tag: t.heading,
        fontWeight: vizhubThemeColors.header.fontWeight,
        color: vizhubThemeColors.header.color,
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
        color: vizhubThemeColors.tag.color,
      },
      {
        tag: [
          t.function(t.variableName),
          t.function(t.propertyName),
        ],
        color: vizhubThemeColors.attribute.color,
      },
      {
        tag: [t.number],
        color: vizhubThemeColors.number.color,
      },
      {
        tag: [
          t.operator,
          t.punctuation,
          t.separator,
          t.url,
          t.escape,
          t.regexp,
        ],
        color: vizhubThemeColors.operator.color,
      },
      {
        tag: [t.regexp],
        color: vizhubThemeColors.atom.color,
      },
      {
        tag: [
          t.special(t.string),
          t.processingInstruction,
          t.string,
          t.inserted,
        ],
        color: vizhubThemeColors.string.color,
      },
      {
        tag: [t.angleBracket],
        color: vizhubThemeColors.operator.color,
      },
      { tag: t.strong, fontWeight: 'bold' },
      { tag: t.emphasis, fontStyle: 'italic' },
      {
        tag: t.strikethrough,
        textDecoration: 'line-through',
      },
      {
        tag: [t.meta, t.comment],
        color: vizhubThemeColors.comment.color,
      },
      {
        tag: t.link,
        color: vizhubThemeColors.link.color,
        textDecoration:
          vizhubThemeColors.link.textDecoration,
      },
      { tag: t.invalid, color: '#ff0000' },
      ...styles,
    ],
  });
}

export const vizhubTheme = vizhubThemeInit();
