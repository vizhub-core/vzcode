import { InteractRule } from '@replit/codemirror-interact';
import * as d3 from "d3"; 

// Regular expression for hex colors.
export const colorPickerRegex = /#[0-9A-Fa-f]{6}/g;
/*
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
*/

//perceptual hcl color
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

    //div for my colorpicker
 
    const colorpick: HTMLDivElement =
    document.createElement('div');
    colorpick.style.position = 'absolute'
    colorpick.style.background = 'white'
    colorpick.style.left = '200px'
    colorpick.style.top = '200px'

    //hcl sliders

    const h: HTMLInputElement =
    document.createElement('input');
    h.type = 'range'
    h.min = '0'
    h.max = '360'
    h.value = '0'
    

    const c: HTMLInputElement = 
    document.createElement('input');
    c.type = 'range'
    c.min = '0'
    c.max = '150' //i think this value can be change but generally should be 150
    c.value = '0'
 

    const l: HTMLInputElement = 
    document.createElement('input');
    l.type = 'range'
    l.min = '0'
    l.max = '100'
    l.value = '0'

    const boxcolor: HTMLDivElement =
    document.createElement('div');
    boxcolor.style.width = '20px'
    boxcolor.style.height = '20px'
    boxcolor.style.background = 'white'

    const colortext: HTMLDivElement =
    document.createElement('div');
    colortext.textContent = "hilol"

    const ok: HTMLButtonElement =
    document.createElement('button');
    ok.textContent = "ok"

    document.body.appendChild(colorpick);
    colorpick.appendChild(h)
    colorpick.appendChild(c)
    colorpick.appendChild(l)
    colorpick.appendChild(boxcolor)
    colorpick.appendChild(colortext)
    colorpick.appendChild(ok)

    function update() {
      const hval = parseFloat(h.value)
      const cval = parseFloat(c.value)
      const lval = parseFloat(l.value)

      //https://d3js.org/d3-color#hcl
      //I guess there are some ways to do this differently but I have experience with d3 and they just give a function that does this for me

      const hcld3 = d3.hcl(hval,cval,lval)
      console.log(hcld3)

      //get in rgb first idk if makes difference but seems good to have anyway
      const rgbd3 = d3.color(hcld3).formatRgb()
      console.log(rgbd3)
     
      //now can make hex for set text
      const hexd3 = d3.color(rgbd3).formatHex()
      console.log(hexd3)

      setText(hexd3) //this is bugged idk why but works when I hardcode a hex like #a10111 but even though hexd3 is in same format it just has a bug it wont change it idk

      colortext.textContent = hexd3
      boxcolor.style.background = hexd3
    }
    h.addEventListener('input', update);
    c.addEventListener('input', update);
    l.addEventListener('input', update);

    function closeok() {
      colorpick.remove()
    }

    ok.addEventListener('click',closeok);

    update();
  },
});
