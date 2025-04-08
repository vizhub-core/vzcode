export const renderTitle = (
  selection,
  { width, height },
) => {
  const g = selection
    .selectAll('.title-container')
    .data([null])
    .join('g')
    .attr('class', 'title-container');

  g.selectAll('.title-text')
    .data([null])
    .join('text')
    .attr('class', 'title-text')
    .attr('x', (width * 1) / 10)
    .attr('y', (height * 1) / 7)
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'middle')
    .text('Data Visualization');

  return g;
};