import { InteractRule } from '@replit/codemirror-interact';
export const boolTogglerRegex = /true|false/g;
export const boolToggler = (
  onInteract?: () => void,
): InteractRule => ({
  regexp: boolTogglerRegex,
  cursor: 'pointer',
  onClick: (text, setText) => {
    setText(text === 'true' ? 'false' : 'true');
    if (onInteract) onInteract();
  },
});
