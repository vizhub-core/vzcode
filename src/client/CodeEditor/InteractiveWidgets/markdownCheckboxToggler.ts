import { InteractRule } from '@replit/codemirror-interact';

export const markdownCheckboxToggler = (
  onInteract?: () => void,
): InteractRule => ({
  regexp: /\[[ x]\]/g, // Matches [ ], [x], [X]
  cursor: 'pointer',
  onClick: (text, setText) => {
    setText(text === '[ ]' ? '[x]' : '[ ]');
    if (onInteract) onInteract();
  },
});
