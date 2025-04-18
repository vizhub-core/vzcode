import { oneDark } from '@codemirror/theme-one-dark';

import { vizhubTheme } from './vizhubTheme';
import {
  okaidia,
  abcdef,
  dracula,
  eclipse,
  githubDark,
  material,
  nord,
  xcodeLight,
} from './uiwImports';

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
  | 'xcode'
  | 'vizhub';

export type ThemeOption = {
  value: any;
  label: ThemeLabel;
};
// add light theme brackets to eclipse theme
// const modifiedEclipse = {
//   ...eclipse,
//   '.rainbow-bracket-red > span': {
//     color: 'white',
//   },
//   '.rainbow-bracket-orange > span': {
//     //yellow
//     color: '#FFFFB2',
//   },
//   '.rainbow-bracket-yellow > span': {
//     // orange
//     color: '#FFB2DA',
//   },
//   '.rainbow-bracket-green > span': {
//     // green
//     color: '#B2FFB2',
//   }
// };
export const themes: Array<ThemeOption> = [
  { value: abcdef, label: 'abcdef' },
  { value: dracula, label: 'dracula' },
  { value: eclipse, label: 'eclipse' },
  { value: material, label: 'material' },
  { value: nord, label: 'nord' },
  { value: oneDark, label: 'oneDark' },
  { value: okaidia, label: 'okaidia' },
  { value: githubDark, label: 'github' },
  { value: xcodeLight, label: 'xcode' },
  { value: vizhubTheme, label: 'vizhub' },
];

// Map theme labels to theme values
export const themeOptionsByLabel: Record<
  ThemeLabel,
  ThemeOption
> = themes.reduce(
  (acc, themeOption: ThemeOption) => {
    acc[themeOption.label] = themeOption;
    return acc;
  },
  {} as Record<ThemeLabel, any>,
);

// The default theme
export const defaultTheme: ThemeLabel = 'vizhub';
