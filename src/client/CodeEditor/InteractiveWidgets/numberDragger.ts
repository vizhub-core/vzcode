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

/*
  //WIP
  // Error: Dragging number offscreen currently changes value randomly
  let dragging = false;

  let globalText: string;
  let globalSetText: (newText: string) => void;


  const handleMouseMove = (e: MouseEvent, text: string, setText: (newText: string) => void) => {

    if (!dragging) return;
    
    const newVal = Number(text) + e.movementX;
    // Change newVal to save current start position and non dragging position to calculate new position?
    if (!isNaN(newVal)) {
      setText(newVal.toString());
      if (onInteract) onInteract();
    }
  };

  const handleMouseUp = () => {
    dragging = false;

    window.removeEventListener('mousemove', handleMouseMoveWrapper);
    window.removeEventListener('mouseup', handleMouseUp);
    
  };

  const handleMouseMoveWrapper = (e: MouseEvent) => {
    if (dragging) {
      e.preventDefault();
    }

    handleMouseMove(e, globalText, globalSetText);
  };

  

  return {
    // Handle user drag value
    regexp: numberDraggerRegex,
    cursor: 'ew-resize',
    onDrag: (text, setText, e) => {
      dragging = true;
      globalText = text; 
      globalSetText = setText; 

      // Listen for global events
      window.addEventListener('mousemove', handleMouseMoveWrapper);
      window.addEventListener('mouseup', handleMouseUp);
    },
  };
};
*/


