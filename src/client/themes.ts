import { oneDark } from '@codemirror/theme-one-dark';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import { abcdef } from '@uiw/codemirror-theme-abcdef';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { githubDark } from '@uiw/codemirror-theme-github';
import { material } from '@uiw/codemirror-theme-material';
import { nord } from '@uiw/codemirror-theme-nord';
import { xcodeLight } from '@uiw/codemirror-theme-xcode';
import { Theme } from 'react-select';
// import { vizhub } from './vizhub-theme';

// CodeMirror themes
export type ThemeLabel =
  | 'abcdef'
  | 'dracula'
  | 'eclipse'
  | 'material'
  | 'nord'
  | 'oneDark'
  | 'okaidia'
  | 'github'
  | 'xcode';
// | 'vizhub'

export const themes: Array<{
  value: any;
  label: ThemeLabel;
}> = [
  { value: abcdef, label: 'abcdef' },
  { value: dracula, label: 'dracula' },
  { value: eclipse, label: 'eclipse' },
  { value: material, label: 'material' },
  { value: nord, label: 'nord' },
  { value: oneDark, label: 'oneDark' },
  { value: okaidia, label: 'okaidia' },
  { value: githubDark, label: 'github' },
  { value: xcodeLight, label: 'xcode' },
  // { value: vizhub, label: 'vizhub' },
];

// Map theme labels to theme values
export const themesByLabel: Record<ThemeLabel, any> = themes.reduce(
  (acc, theme) => {
    acc[theme.label] = theme.value;
    return acc;
  },
  {} as Record<ThemeLabel, any>,
);

// The default theme
export const defaultTheme: ThemeLabel = 'oneDark';
