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
    .style('background', '#F0FFF4');

  console.log(ff.ds);

  const data = [
    { x: 155, y: 382, r: 20, fill: '#D4089D' },
    { x: 340, y: 238, r: 52, fill: '#FF0AAE' },
    { x: 531, y: 59, r: 20, fill: '#00FF88' },
    { x: 482, y: 275, r: 147, fill: '#7300FF' },
    { x: 781, y: 303, r: 61, fill: '#0FFB33' },
    { x: 668, y: 229, r: 64, fill: '#D400FF' },
    { x: 316, y: 396, r: 85, fill: '#0FF0FF' },
  ];

  svg
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', (d) => d.r)
    .attr('fill', (d) => d.fill)
    .attr('opacity', 0.7);
};
