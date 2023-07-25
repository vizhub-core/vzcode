import { oneDark } from '@codemirror/theme-one-dark';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import { abcdef } from '@uiw/codemirror-theme-abcdef';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { githubDark } from '@uiw/codemirror-theme-github';
import { material } from '@uiw/codemirror-theme-material';
import { nord } from '@uiw/codemirror-theme-nord';
import { xcodeLight } from '@uiw/codemirror-theme-xcode';

// CodeMirror themes
export const themes = [
  { value: abcdef, label: 'abcdef' },
  { value: dracula, label: 'darcula' },
  { value: eclipse, label: 'eclipse' },
  { value: material, label: 'material' },
  { value: nord, label: 'nord' },
  { value: oneDark, label: 'oneDark' },
  { value: okaidia, label: 'okaidia' },
  { value: githubDark, label: 'github' },
  { value: xcodeLight, label: 'xcode' },
];

// Map theme labels to theme values
export const themesByLabel = themes.reduce((acc, theme) => {
  acc[theme.label] = theme.value;
  return acc;
}, {});

// The default theme
export const defaultTheme = 'oneDark';
