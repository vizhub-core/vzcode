import { InteractRule } from '@replit/codemirror-interact';

let isDragging = false;
let activeSetText = null;

let currentValue = 0;
let startValue = 0;
let startX = 0;


// Mouse move tracker
// If user it not moving mouse or not setting text return
// Update position to user position + the starting value of when suer drags value
const GlobalMouseMove = (e) => {
  if (!isDragging || !activeSetText) return;

  const delta = e.clientX - startX;
  currentValue = startValue + delta; 
  if (!isNaN(currentValue)) {
    activeSetText(currentValue.toString());
  }
};

// Global mouse up listener
const GlobalMouseUp = () => {
  if (!isDragging) return;
  isDragging = false;
  activeSetText = null;

  document.removeEventListener('mousemove', GlobalMouseMove);
  document.removeEventListener('mouseup', GlobalMouseUp);
};

export const numberDragger = (
  onInteract?: () => void,
): InteractRule => ({

  regexp: /(?<!\#)-?\b\d+\.?\d*\b/g,
  cursor: 'ew-resize',
  
  onDrag: (text, setText, e) => {
    // Initialize drag state
    if (!isDragging) {
      isDragging = true;
      startValue = Number(text);
      currentValue = startValue;
      startX = e.clientX;
      activeSetText = setText;

      document.addEventListener('mousemove', GlobalMouseMove);
      document.addEventListener('mouseup', GlobalMouseUp);
    }

    if (onInteract) onInteract();
  },
});



// const numberDraggerRegex = /(?<!\#)-?\b\d+\.?\d*\b/g;
// // a rule for a number dragger
// export const numberDragger = (
//   onInteract?: () => void,
// ): InteractRule => ({
//   // the regexp matching the value
//   regexp: numberDraggerRegex,
//   // set cursor to "ew-resize" on hover
//   cursor: 'ew-resize',
//   // change number value based on mouse X movement on drag
//   onDrag: (text, setText, e) => {
//     const newVal = Number(text) + e.movementX;
//     if (isNaN(newVal)) return;
//     setText(newVal.toString());
//     if (onInteract) onInteract();
//   },
//});


