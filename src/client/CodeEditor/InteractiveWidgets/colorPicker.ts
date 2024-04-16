import { InteractRule } from '@replit/codemirror-interact';

// Regular expression for hex colors.
export const colorPickerRegex = /#[0-9A-Fa-f]{6}/g;

// hex color picker
// Inspired by https://github.com/replit/codemirror-interact/blob/master/dev/index.ts#L71
// Works without quotes to support CSS.
export const colorPicker = (
  onInteract?: () => void,
): InteractRule => ({
  regexp: colorPickerRegex,
  cursor: 'pointer',
  onClick(
    text: string,
    setText: (newText: string) => void,
  ) {
    const startingColor: string = text;

    const sel: HTMLInputElement =
      document.createElement('input');
    sel.type = 'color';
    sel.value = startingColor.toLowerCase();

    // `valueIsUpper` maintains the style of the user's code.
    // It keeps the case of a-f the same case as the original.
    const valueIsUpper: boolean =
      startingColor.toUpperCase() === startingColor;

    const updateHex = (e: Event) => {
      const el: HTMLInputElement =
        e.target as HTMLInputElement;
      if (el.value) {
        setText(
          valueIsUpper ? el.value.toUpperCase() : el.value,
        );
      }
      if (onInteract) onInteract();
    };
    sel.addEventListener('input', updateHex);
    sel.click();
  },
});

// TODO get this working
// rgb color picker
// Inspired by https://github.com/replit/codemirror-interact/blob/master/dev/index.ts#L71
//TODO: create color picker for hsl colors
// {
//   regexp: /rgb\(.*\)/g,
//   cursor: 'pointer',
//   onClick: (text, setText, e) => {
//     const res =
//       /rgb\((?<r>\d+)\s*,\s*(?<g>\d+)\s*,\s*(?<b>\d+)\)/.exec(
//         text,
//       );
//     const r = Number(res?.groups?.r);
//     const g = Number(res?.groups?.g);
//     const b = Number(res?.groups?.b);

//     //sel will open the color picker when sel.click is called.
//     const sel = document.createElement('input');
//     sel.type = 'color';

//     if (!isNaN(r + g + b)) sel.value = rgb2Hex(r, g, b);

//     const updateRGB = (e: Event) => {
//       const el = e.target as HTMLInputElement;
//       if (onInteract) onInteract();

//       if (el.value) {
//         const [r, g, b] = hex2RGB(el.value);
//         setText(`rgb(${r}, ${g}, ${b})`);
//       }
//       sel.removeEventListener('change', updateRGB);
//     };

//     sel.addEventListener('change', updateRGB);
//     sel.click();
//   },
// },

// // Inspired by https://github.com/replit/codemirror-interact/blob/master/dev/index.ts#L108
// const hex2RGB = (hex: string): [number, number, number] => {
//   const v = parseInt(hex.substring(1), 16);
//   return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
// };

// // Inspired by https://github.com/replit/codemirror-interact/blob/master/dev/index.ts#L117
// const rgb2Hex = (r: number, g: number, b: number): string =>
//   '#' + r.toString(16) + g.toString(16) + b.toString(16);
