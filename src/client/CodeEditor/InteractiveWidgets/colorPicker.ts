import { InteractRule } from '@replit/codemirror-interact';
import {
  EditorView,
  WidgetType,
  Decoration,
  StateEffect,
} from '@codemirror/view';

class ColorPickerWidget extends WidgetType {
  constructor(
    public color: string,
    public onChange: (newColor: string) => void,
  ) {
    super();
  }

  toDOM() {
    const picker = document.createElement('input');
    picker.type = 'color';
    picker.value = this.color;

    picker.oninput = (event) => {
      const newColor = (event.target as HTMLInputElement)
        .value;
      this.onChange(newColor);
    };

    return picker;
  }
}

const addColorPreview = (
  editorView: EditorView,
  from: number,
  color: string,
) => {
  const preview = document.createElement('span');
  preview.style.display = 'inline-block';
  preview.style.width = '10px';
  preview.style.height = '10px';
  preview.style.backgroundColor = color;
  preview.style.marginLeft = '5px';
  preview.style.border = '1px solid #000';

  const deco = Decoration.widget({
    widget: { toDOM: () => preview },
    side: 1,
  });

  editorView.dispatch({
    effects: StateEffect.appendConfig.of(
      EditorView.decorations.of(deco),
    ),
  });
};

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
    event: MouseEvent,
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

    // Position the color input at the mouse cursor
    sel.style.position = 'absolute';
    sel.style.left = `${event.clientX}px`;
    sel.style.top = `${event.clientY}px`;

    // Make it invisible
    sel.style.opacity = '0';
    sel.style.height = '0';
    sel.style.width = '0';
    sel.style.border = 'none';
    sel.style.padding = '0';
    sel.style.margin = '0';
    document.body.appendChild(sel);

    // Click the input after a delay, so that
    // it gets the correct position
    setTimeout(() => {
      sel.click();
    }, 10);

    // Remove the input after interaction
    sel.addEventListener('blur', () => {
      document.body.removeChild(sel);
    });
  },
});
