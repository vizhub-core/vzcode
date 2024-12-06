import { InteractRule } from '@replit/codemirror-interact';
import * as d3 from "d3"; 
import './style.css';
import './tailstuff.css';

// Regular expression for hex colors.
export const colorPickerRegex = /#[0-9A-Fa-f]{6}/g;

// hex color picker
// Inspired by https://github.com/replit/codemirror-interact/blob/master/dev/index.ts#L71
// Works without quotes to support CSS.
export const defcolorPicker = (
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

//perceptual hcl color
export const colorPicker = (
  onInteract?: () => void,
): InteractRule => ({
  regexp: colorPickerRegex,
  cursor: 'pointer',
  onClick(
    text: string,
    setText: (newText: string) => void,
    pos: MouseEvent
  ) {
    const startingColor: string = text;

    //div for my colorpicker
 
    const colorpick: HTMLDivElement =
    document.createElement('div');
    colorpick.className = 'absolute bg-white rounded-lg shadow-lg p-3 w-80 space-y-1';
    colorpick.style.left = `${pos.clientX}px`; 
    colorpick.style.top = `${pos.clientY}px`;  
    const ok: HTMLButtonElement =
    document.createElement('button');
    ok.textContent = "ok"

    const switchh: HTMLSpanElement = document.createElement('span');
    switchh.textContent = 'switch';
    switchh.className = 'cursor-pointer text-grey-500 text-sm';
    switchh.addEventListener('click', () => {
      closeok(); 
      defcolorPicker(onInteract).onClick(text, setText, new MouseEvent('click')); 
    });

    const colortext: HTMLSpanElement = document.createElement('span'); 
    colortext.textContent = "hi"; 

    const hcl: HTMLDivElement = document.createElement('div');
    hcl.className = 'flex justify-between items-center border-b pb-1 mb-2';
    
    const words: HTMLSpanElement = document.createElement('span'); 
    words.textContent = 'color space: hcl';

    hcl.appendChild(words);
    hcl.appendChild(switchh); 
    hcl.appendChild(colortext);
    hcl.appendChild(ok)
    colorpick.appendChild(hcl);

    //hcl sliders

    const hname: HTMLLabelElement = 
    document.createElement('label');
    hname.textContent = "h: "

    const h: HTMLInputElement =
    document.createElement('input');
    h.type = 'range'
    h.min = '0'
    h.max = '360'
    h.value = '0'
    h.className = 'hslide';

    const cname: HTMLLabelElement = 
    document.createElement('label');
    cname.textContent = "c: "

    const c: HTMLInputElement = 
    document.createElement('input');
    c.type = 'range'
    c.min = '0'
    c.max = '150' //i think this value can be change but generally should be 150
    c.value = '0'
    c.className = 'cslide';

    const lname: HTMLLabelElement = 
    document.createElement('label');
    lname.textContent = "l: "

    const l: HTMLInputElement = 
    document.createElement('input');
    l.type = 'range'
    l.min = '0'
    l.max = '100'
    l.value = '0'
    l.className = 'lslide';

    const boxcolor: HTMLDivElement =
    document.createElement('div');
    boxcolor.style.width = '20px'
    boxcolor.style.height = '20px'
    boxcolor.style.background = 'white'

    const hdiv: HTMLDivElement =
    document.createElement('div');
    hdiv.style.display = 'flex'
    hdiv.style.alignItems = 'center'

    hdiv.appendChild(hname)
    hdiv.appendChild(h)

    const cdiv: HTMLDivElement =
    document.createElement('div');
    cdiv.style.display = 'flex'
    cdiv.style.alignItems = 'center'

    cdiv.appendChild(cname)
    cdiv.appendChild(c)

    const ldiv: HTMLDivElement =
    document.createElement('div');
    ldiv.style.display = 'flex'
    ldiv.style.alignItems = 'center'

    ldiv.appendChild(lname)
    ldiv.appendChild(l)
    
    document.body.appendChild(colorpick);
    colorpick.append(hdiv)
    colorpick.append(cdiv)
    colorpick.append(ldiv)

    function update() {
      const hval = parseFloat(h.value)
      const cval = parseFloat(c.value)
      const lval = 100 - parseFloat(l.value);
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
      console.log(hexd3.length)
      //setText("#002e74")
     // setText(hexd3.toString()) //this is bugged idk why but works when I hardcode a hex like #a10111 but even though hexd3 is in same format it just has a bug it wont change it idk
      console.log(hexd3)
    //  colortext.textContent = hexd3
      colortext.textContent = hexd3
      colortext.style.color = hexd3; 
    //  boxcolor.style.background = hexd3
     // setText(String(hexd3))
     // setText("#ff1000")
      let fix = "#"
      fix += String(hexd3[1])
      fix += String(hexd3[2])
      fix += String(hexd3[3])
      fix += String(hexd3[4])
      fix += String(hexd3[5])
      fix += String(hexd3[6])
      setText(fix)

      c.style.setProperty('--color', hexd3)
    
      const gradient = `
        linear-gradient(
        to right,
        hsl(0, 0%, 100%), 
        hsl(0, 0%, 0%)    
        )
        `;
     
      l.style.setProperty('--gradient', gradient)
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


