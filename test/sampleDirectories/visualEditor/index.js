import { unidirectionalDataFlow } from 'd3-rosetta';
import { viz } from './viz';
const container = document.getElementById('viz-container');
unidirectionalDataFlow(container, viz);