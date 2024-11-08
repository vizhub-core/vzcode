import { InteractRule } from '@replit/codemirror-interact';

// Regular expression for hex colors.
export const colorPickerRegex = /#[0-9A-Fa-f]{6}/g;

// hex color picker
// Inspired by https://github.com/replit/codemirror-interact/blob/master/dev/index.ts#L71
// Works without quotes to support CSS.
export const colorPicker = (
  onInteract?: () => void,
):  InteractRule => {
  // Create the color picker element when the page loads
  const sel: HTMLInputElement = document.createElement('input');
  sel.type = 'color';
  sel.style.position = 'fixed';
  sel.style.left = '-9999px'; // Initially off-screen
  sel.style.top = '-9999px';
  document.body.appendChild(sel);

  // Create a close button element to hide the color picker
  const closeButton: HTMLButtonElement = document.createElement('button');
  closeButton.innerText = 'X';
  closeButton.style.position = 'absolute';
  closeButton.style.width = '20px';
  closeButton.style.height = '20px';
  closeButton.style.borderRadius = '50%';
  closeButton.style.border = 'none';
  closeButton.style.backgroundColor = '#ff4d4f';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '12px';
  closeButton.style.display = 'none'; // Initially hidden
  closeButton.style.cursor = 'pointer';
  closeButton.style.top = '-10px'; // Adjust position relative to color picker
  closeButton.style.right = '-10px';
  sel.parentElement?.appendChild(closeButton); // Add button to the same container

  // Function to hide the color picker and close button
  const hideColorPicker = () => {
    sel.style.left = '-9999px';
    sel.style.top = '-9999px';
    closeButton.style.display = 'none';
  };

  // Add event listener to the close button to hide color picker
  closeButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent click event from bubbling to document
    hideColorPicker();
  });

  // Add event listener for clicks outside the color picker
  document.addEventListener('click', (event: MouseEvent) => {
    if (event.target !== sel && event.target !== closeButton) {
      hideColorPicker();
    }
  });

  return {
    regexp: colorPickerRegex,
    cursor: 'pointer',

    onClick(
      text: string,
      setText: (newText: string) => void,
      event: MouseEvent
    ) {
      const startingColor: string = text;

      // Set the initial value of the color picker
      sel.value = startingColor.toLowerCase();

      // Position the color picker near the cursor
      const cursorX = event.clientX;
      const cursorY = event.clientY;
      sel.style.left = cursorX + 'px';
      sel.style.top = cursorY + 'px';

      // Show and position the close button
      closeButton.style.display = 'block';
      closeButton.style.left = `${cursorX + sel.offsetWidth - 15}px`; // Adjust to place in corner
      closeButton.style.top = `${cursorY - 15}px`;

      // Update the color selection and setText on change
      const updateHex = (e: Event) => {
        const el: HTMLInputElement = e.target as HTMLInputElement;
        if (el.value) {
          setText(el.value.toUpperCase()); // Use uppercase for consistency
        }
        if (onInteract) onInteract();
      };

      // Add input event listener to handle color selection
      sel.addEventListener('input', updateHex);

      // Trigger click event on the color picker to display it
      sel.click();
    },
  };
};

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
