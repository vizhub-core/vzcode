import interact, {
  InteractRule,
} from '@replit/codemirror-interact';
import { urlClicker } from './urlClicker';
import { colorPicker } from './colorPicker';
import { numberDragger } from './numberDragger';
import { boolToggler } from './boolToggler';
import { vec2Slider } from './vec2Slider';
import { rotateWidget } from './rotateWidget';
import { markdownCheckboxToggler } from './markdownCheckboxToggler';

// Additional supporting CodeMirror plugins.
export { colorsInTextPlugin } from './colorsInTextPlugin';
export { rotationIndicator } from './rotateWidget';

// Interactive code widgets.
//  * Number dragger
//  * Boolean toggler
//  * URL clicker
//  * color picker
// Inspired by:
// https://github.com/replit/codemirror-interact/blob/master/dev/index.ts
// `onInteract` is called when the user interacts with a widget.
export const widgets = ({
  onInteract,
  customInteractRules,
}: {
  onInteract?: () => void;
  customInteractRules?: Array<InteractRule>;
  editorView: EditorView;
}) => { if (editorView) {
  activateColorPicker(editorView); // Ensure this runs for applicable files
}
  const rules: Array<InteractRule> = [
    colorPicker(onInteract),
    numberDragger(onInteract),
    markdownCheckboxToggler(onInteract),
    boolToggler(onInteract),
    vec2Slider(onInteract),
    rotateWidget(onInteract),
    urlClicker,
  ];
  if (customInteractRules) {
    rules.push(...customInteractRules);
  }
  return interact({ rules });
};
