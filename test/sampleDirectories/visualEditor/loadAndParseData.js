import { csv } from 'd3';

export const loadAndParseData = async (dataUrl) =>
  await csv(dataUrl, (d, i) => {
    d.sepal_length = +d.sepal_length;
    d.sepal_width = +d.sepal_width;
    d.petal_length = +d.petal_length;
    d.petal_width = +d.petal_width;
    d.id = i; 
    return d;
  });
