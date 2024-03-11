console.log('This is a test file to edit');

let cyberData = {};
cyberData['test'] = 'foo';
const initialData = [
  { x: 155, y: 386, r: 20, fill: '#0000FF' },
  { x: 340, y: 238, r: 52, fill: '#FF0AAE' },
  { x: 531, y: 151, r: 20, fill: '#00FF88' },
  { x: 482, y: 307, r: 147, fill: '#7300FF' },
  { x: 781, y: 91, r: 61, fill: '#0FFB33' },
  { x: 668, y: 229, r: 64, fill: '#D400FF' },
];
// Add IDs to each datum
for (let i = 0; i < initialData.length; i++) {
  initialData[i].id = i + 1;
}
