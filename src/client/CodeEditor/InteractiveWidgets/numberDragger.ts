import { InteractRule } from '@replit/codemirror-interact';
let isDragging = false;
let activeSetText = null;
let startValue = 0;
let startX = 0;
let preview = null;

// Create preview element to prevent number drag issues
/*Note:
  Previous edit had bug where if user drags the number from 3 digit value
  to 4 digit value the number being dragged would have text set to 4 digit value
  and the 4th digit would be printed to the right

  If user dragged it to left then going from 3 to 2 digit value would delete the character
  to the right and lines after the number value each time the value was dragged to the left.
*/
const createPreview = () => {
  const previewElement = document.createElement('div');
  previewElement.style.position = 'fixed';
  previewElement.style.backgroundColor = '#2a2a2a';
  previewElement.style.color = 'white';
  previewElement.style.padding = '4px 8px';
  previewElement.style.borderRadius = '4px';
  previewElement.style.pointerEvents = 'none';
  previewElement.style.zIndex = '100';
  previewElement.style.fontFamily = 'monospace';
  previewElement.id = 'number-preview';
  document.body.appendChild(previewElement);

  return previewElement;
};

// Replace updating number with set text make a preview number that is constantly updated 
const updatePreview = (originalElement, value, initialPosition = false) => {
  if (!preview) preview = createPreview();
  
  preview.textContent = value.toString();
  const previewPos = originalElement.getBoundingClientRect();
  
  preview.style.left = `${previewPos.left}px`;
  preview.style.top = `${previewPos.top - preview.offsetHeight - 5}px`; 
};

// Global mouse move handler
const GlobalMouseMove = (e) => {
  if (!isDragging || !activeSetText) return;
  const delta = e.clientX - startX;
  const currentValue = startValue + delta;
  
  if (!isNaN(currentValue)) {
    preview.textContent = currentValue.toString();
  }
};

// Global mouse up handler
const GlobalMouseUp = (e) => {
  if (!isDragging) return;
  
  if (preview && activeSetText) {
    const finalValue = parseInt(preview.textContent || '0', 10);
    // ParseInt to get integer value | 10 for ints base 10
    if (!isNaN(finalValue)) {
      activeSetText(finalValue.toString());
    }
    
    document.body.removeChild(preview);
    preview = null;
  }

  isDragging = false;
  activeSetText = null;

  window.removeEventListener('mousemove', GlobalMouseMove);
  window.removeEventListener('mouseup', GlobalMouseUp);
};

export const numberDragger = (
  onInteract?: () => void,
): InteractRule => ({
  regexp: /(?<!\#)-?\d+/g,
  cursor: 'ew-resize',
  
  onDrag: (text, setText, e) => {
    if (!isDragging) {

      isDragging = true;
      startValue = parseInt(text, 10);
      startX = e.clientX;
      activeSetText = setText;

      preview = createPreview();
      updatePreview(e.target, startValue);


      window.addEventListener('mousemove', GlobalMouseMove);
      window.addEventListener('mouseup', GlobalMouseUp);
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


