// import { hcl } from 'd3-color';

// This module defines all the colors for the VizHub theme.
// Ported from the CodeMirror 5 theme defined here:
// https://github.com/vizhub-core/vizhub-legacy/blob/01cadfb78a2611df32f981b1fd8136b70447de9e/vizhub-v2/packages/neoFrontend/src/pages/VizPage/Body/Editor/themes/vizHub.js

// This is how the colors were generated:
// const sidebarDark = hcl('#3d4b65');
// const sidebarLight = hcl('#5b677d');
// const luminaceDifference = sidebarLight.l - sidebarDark.l;
// const backgroundLuminance =
//   sidebarDark.l - luminaceDifference * 1.1;
// const luminance = 90;
// export const backgroundColor = hcl(
//   sidebarDark.h,
//   sidebarDark.c,
//   backgroundLuminance,
// ).formatHex();
// export const light = hcl(0, 0, luminance).formatHex();
// export const dark = hcl(
//   sidebarDark.h,
//   sidebarDark.c,
//   80,
// ).formatHex();
// console.log(
//   JSON.stringify(
//     {
//       backgroundColor,
//       light,
//       dark,
//     },
//     null,
//     2,
//   ),
// );

// These are inlined from the above code, but the code is kept around for future reference.
export const backgroundColor = '#202e46';
export const light = '#e2e2e2';
export const dark = '#b9c7e6';

export const lineNumbers = 'rgba(255,255,255,0.2)';
export const lineNumbersActive = 'rgba(255,255,255,0.5)';
export const selectionBackground = '#000';
export const selectionBackgroundMatch = 'rgba(0,0,0,0.4)';
export const lineHighlight = 'rgba(0,0,0,0.1)';
export const caretColor = 'white';

// Compute 6 colors that are evenly spaced in terms of hue
// Keeping this code around for future reference
// const rotation = 0.397;
// const numColors = 6;
// const highlightColors = Array.from(
//   { length: numColors },
//   (_, i) => {
//     let t = (i / numColors + rotation) % 1;
//     return hcl(t * 360, saturation, luminance).formatHex();
//   },
// );
// console.log(JSON.stringify(highlightColors));

// We inline the colors here, but the code above is how they were generated.
const highlightColors = [
  '#77fd8c',
  '#00ffff',
  '#66ecff',
  '#ffb9ff',
  '#ffabb3',
  '#ffdb56',
];

export const MINT = highlightColors[0];
export const AQUA = highlightColors[1];
export const SKY = highlightColors[2];
export const LAVENDER = highlightColors[3];
export const SALMON = highlightColors[4];
export const GOLDENROD = highlightColors[5];

// Red that's not too bright, for errors
export const PANIC = '#ff2222';
