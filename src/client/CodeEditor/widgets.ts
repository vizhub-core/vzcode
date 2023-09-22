import interact from '@replit/codemirror-interact';

// Interactive code widgets.
//  * Number dragger
//  * Boolean toggler
//  * URL clicker
//  * TODO color picker
// Inspired by:
// https://github.com/replit/codemirror-interact/blob/master/dev/index.ts
// `onInteract` is called when the user interacts with a widget.
export const widgets = ({
  onInteract,
}: {
  onInteract?: () => void;
}) =>
  interact({
    rules: [
      // a rule for a number dragger
      {
        // the regexp matching the value
        regexp: /-?\b\d+\.?\d*\b/g,
        // set cursor to "ew-resize" on hover
        cursor: 'ew-resize',
        // change number value based on mouse X movement on drag
        onDrag: (text, setText, e) => {
          if (onInteract) onInteract();
          const newVal = Number(text) + e.movementX;
          if (isNaN(newVal)) return;
          setText(newVal.toString());
        },
      },
      // bool toggler
      {
        regexp: /true|false/g,
        cursor: 'pointer',
        onClick: (text, setText) => {
          if (onInteract) onInteract();
          switch (text) {
            case 'true':
              return setText('false');
            case 'false':
              return setText('true');
          }
        },
      },
      //vec2 slider
      // Inspired by: https://github.com/replit/codemirror-interact/blob/master/dev/index.ts#L61
      {
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
          setText(
            `vec2(${x + e.movementX}, ${y - e.movementY})`,
          );
        },
      },
      //color picker
      //TODO: create color picker for hsl colors
      {
        regexp: /rgb\(.*\)/g,
        cursor: 'pointer',
        onClick: (text, setText, e) => {
          const res =
            /rgb\((?<r>\d+)\s*,\s*(?<g>\d+)\s*,\s*(?<b>\d+)\)/.exec(
              text,
            );
          const r = Number(res?.groups?.r);
          const g = Number(res?.groups?.g);
          const b = Number(res?.groups?.b);

          //sel will open the color picker when sel.click is called.
          const sel = document.createElement('input');
          sel.type = 'color';
          if (!isNaN(r + g + b))
            sel.value = rgb2Hex(r, g, b);

          const updateRGB = (e: Event) => {
            const el = e.target as HTMLInputElement;
            if (el.value) {
              const [r, g, b] = hex2RGB(el.value);
              setText(`rgb(${r}, ${g}, ${b})`);
            }
            sel.removeEventListener('change', updateRGB);
          };

          sel.addEventListener('change', updateRGB);
          sel.click();
        },
      },
      // url clicker
      {
        regexp: /https?:\/\/[^ "]+/g,
        cursor: 'pointer',
        onClick: (text) => {
          window.open(text);
        },
      },
    ],
  });

const hex2RGB = (hex: string): [number, number, number] => {
  const v = parseInt(hex.substring(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

const rgb2Hex = (r: number, g: number, b: number): string =>
  '#' + r.toString(16) + g.toString(16) + b.toString(16);
