import interact, {
  InteractRule,
} from '@replit/codemirror-interact';
import { urlClicker } from './urlClicker';
import { colorPicker } from './colorPicker';
import { numberDragger } from './numberDragger';
import { boolToggler } from './boolToggler';
import { vec2Slider } from './vec2Slider';
import { rotateWidget } from './rotateWidget';

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
}) => {
  const rules: Array<InteractRule> = [
    colorPicker(onInteract),
    numberDragger(onInteract),
    boolToggler,
    vec2Slider,
    urlClicker,
    rotateWidget,
  ];
  if (customInteractRules) {
    rules.push(...customInteractRules);
  }
  return interact({ rules });
};
