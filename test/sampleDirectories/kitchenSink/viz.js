import { select } from 'd3';

export const viz = (container) => {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const svg = select(container)
    .selectAll('svg')
    .data([null])
    .join('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', '#F0F0FF');

  const data = [
    { x: 100, y: 350, size: 20, fill: '#8A2BE2' },
    { x: 300, y: 200, size: 52, fill: '#9370DB' },
    { x: 550, y: 50, size: 20, fill: '#BA55D3' },
    { x: 500, y: 250, size: 147, fill: '#9400D3' },
    { x: 800, y: 300, size: 61, fill: '#9932CC' },
    { x: 700, y: 200, size: 64, fill: '#8B008B' },
    { x: 300, y: 400, size: 85, fill: '#D8BFD8' },
  ];

  svg
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', (d) => d.x - d.size / 2)
    .attr('y', (d) => d.y - d.size / 2)
    .attr('width', (d) => d.size)
    .attr('height', (d) => d.size)
    .attr('fill', (d) => d.fill)
    .attr('opacity', 0.7);
};