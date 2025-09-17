export const renderLoadingState = (
  svg,
  {
    x,
    y,
    text,
    shouldShow,
    fontSize,
    fontFamily,
    loadingTextColor = '#bbbbbb',
  },
) => {
  svg
    .selectAll('text.loading-text')
    .data(shouldShow ? [null] : [])
    .join('text')
    .attr('class', 'loading-text')
    .attr('x', x)
    .attr('y', y)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', fontSize)
    .attr('font-family', fontFamily)
    .attr('fill', loadingTextColor)
    .text(text);
};
