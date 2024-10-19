import { InteractRule } from '@replit/codemirror-interact';

const numberDraggerRegex = /(?<!\#)-?\b\d+\.?\d*\b/g;

// a rule for a number dragger
export const numberDragger = (
  onInteract?: () => void,
): InteractRule => ({
  // the regexp matching the value
  regexp: numberDraggerRegex,
  // set cursor to "ew-resize" on hover
  cursor: 'ew-resize',
  // change number value based on mouse X movement on drag
  onDrag: (text, setText, e) => {
    const newVal = Number(text) + e.movementX;
    if (isNaN(newVal)) return;
    setText(newVal.toString());
    if (onInteract) onInteract();
  },
});
