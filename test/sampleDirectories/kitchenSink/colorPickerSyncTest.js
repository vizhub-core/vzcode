// This file is for testing that the color picker
// and number dragger are robust to changes in the document
// that happen before them.
// To test:
//  * Set `slowdown = true` in `generateAIResponse`
//  * Trigger the AI generation on `scatterplot = `
//  * While it is generating, interact with the color and number
//  * The document shouold not get out of sync

// TODO Make a scatter plot with D3
const scatterPlot;

// Test what happens when you go from 100 to 99, or 999 to 1000.
const number = 150;
const color = '#1EB39A';
