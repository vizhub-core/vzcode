import { InteractRule } from '@replit/codemirror-interact';
export const boolTogglerRegex = /true|false/g;
export const boolToggler: InteractRule = {
  regexp: boolTogglerRegex,
  cursor: 'pointer',
  onClick: (text: string) =>
    text === 'true' ? 'false' : 'true',
};
