import { InteractRule } from '@replit/codemirror-interact';

export const urlClickerRegex =
  /https?:\/\/[^\s'")]*([^\s'",;.]|\([^\s'")]*\)|\b)/g;

export const urlClicker: InteractRule = {
  regexp: urlClickerRegex,
  cursor: 'pointer',
  onClick: (text: string) => {
    window.open(text);
  },
};
