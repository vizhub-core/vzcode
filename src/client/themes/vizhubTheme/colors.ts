import { hcl } from 'd3-color';

// A CodeMirror 6 theme for the VizHub syntax highlighting colors.
// Ported from the CodeMirror 5 theme defined here:
// https://github.com/vizhub-core/vizhub-legacy/blob/01cadfb78a2611df32f981b1fd8136b70447de9e/vizhub-v2/packages/neoFrontend/src/pages/VizPage/Body/Editor/themes/vizHub.js
const sidebarDark = hcl('#3d4b65');
const sidebarLight = hcl('#5b677d');
const luminaceDifference = sidebarLight.l - sidebarDark.l;
const backgroundLuminance =
  sidebarDark.l - luminaceDifference * 1.1;
const luminance = 90;
const saturation = 70;

export const backgroundColor = hcl(
  sidebarDark.h,
  sidebarDark.c,
  backgroundLuminance,
).formatHex();

export const light = hcl(0, 0, luminance).formatHex();
export const dark = hcl(
  sidebarDark.h,
  sidebarDark.c,
  80,
).formatHex();
export const lineNumbers = 'rgba(255,255,255,0.2)';
export const lineNumbersActive = 'rgba(255,255,255,0.5)';
export const selectionBackground = '#000';
export const selectionBackgroundMatch = 'rgba(0,0,0,0.4)';
export const lineHighlight = 'rgba(0,0,0,0.1)';
export const caretColor = 'white';

// Compute 6 colors that are evenly spaced in terms of hue
const rotation = 0.397;
const numColors = 6;
export const highlightColors = Array.from(
  { length: numColors },
  (_, i) => {
    let t = (i / numColors + rotation) % 1;
    return hcl(t * 360, saturation, luminance).formatHex();
  },
);
