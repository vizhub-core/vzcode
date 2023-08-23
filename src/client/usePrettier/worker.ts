// import { build } from './build';

onmessage = async ({ data }) => {
  console.log('in worker', data);
  postMessage('result');
};
