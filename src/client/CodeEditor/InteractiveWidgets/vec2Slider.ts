// vec2 slider
// Inspired by: https://github.com/replit/codemirror-interact/blob/master/dev/index.ts#L61

import { InteractRule } from '@replit/codemirror-interact';

export const vec2Slider = (
  onInteract?: () => void,
): InteractRule => ({
  regexp:
    /vec2\(-?\b\d+\.?\d*\b\s*(,\s*-?\b\d+\.?\d*\b)?\)/g,
  cursor: 'move',

  onDrag: (text, setText, e) => {
    const res =
      /vec2\((?<x>-?\b\d+\.?\d*\b)\s*(,\s*(?<y>-?\b\d+\.?\d*\b))?\)/.exec(
        text,
      );
    const x = Number(res?.groups?.x);
    let y = Number(res?.groups?.y);
    if (isNaN(x)) return;
    if (isNaN(y)) y = x;
    setText(`vec2(${x + e.movementX}, ${y - e.movementY})`);
    if (onInteract) onInteract();
  },
});
