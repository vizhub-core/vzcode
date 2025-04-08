import { renderSVG } from './renderSVG.js';
import { renderTitle } from './renderTitle.js';
import { renderBars } from './renderBars.js';
import { loadData } from './loadData.js';

export const main = (container, { state, setState }) => {
  if (!state.dimensions) return;

  const { width, height } = state.dimensions;
  const svg = renderSVG(container, { width, height });

  const data = loadData({ state, setState });
  if (!data) return;

  renderBars(svg, {
    data,
    width,
    height,
    state,
    setState,
  });

  renderTitle(svg, {
    width,
    height,
  });
};
