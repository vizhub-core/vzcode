console.log('This is a test file to edit');

d3.select('body');

const citiesURL =
  'https://raw.githubusercontent.com/vspatel927/CS573-Final-Project/main/parks.csv';

// Link test:
// https://vizhub.com/curran/parallel-coordinates-with-brushing
//
let cyberData = {};
cyberData['test'] = 'foo';
const initialData = [
  { x: 155, y: 386, r: 20, fill: '#319B78' },
  { x: 340, y: 238, r: 52, fill: '#99156D' },
  { x: 531, y: 151, r: 20, fill: '#00FF88' },
  { x: 482, y: 307, r: 147, fill: '#00FFBF' },
  { x: 781, y: 91, r: 61, fill: '#0E3DFB' },
  { x: 668, y: 229, r: 64, fill: '#7300FF' },
  // TODO add more circles
  { x: 447, y: 350, r: 70, fill: '#007AFF' },
  { x: 724, y: 400, r: 30, fill: '#34BA78' },
  { x: 510, y: 298, r: 80, fill: '#8C00FF' },
  { x: 510, y: 298, r: 80, fill: '#121845' },
  { x: 510, y: 298, r: 80, fill: '#001EFF' },
  { x: 510, y: 298, r: 80, fill: '#00FF88' },
  { x: 510, y: 298, r: 80, fill: '#001EFF' },
  { x: 510, y: 298, r: 80, fill: '#001EFF' },
  
  { x: 270, y: 390, r: 44, fill: '#00F7FA' },
];

// Add IDs to each datum
for (let i = 0; i < initialData.length; i++) {
  initialData[i].id = i + 1;
}
const text = 'foo';
// Split the text into lines
const lines = text.trim().split('\n');

// Initialize an empty array to store the data
const data = [];

for (let i = 1; i < lines.length; i++) {
  const [Month, High, Temp, Low] = lines[i].split(',');
  console.log(Month, High, Temp, Low); // Debugging
  data.push({
    Month: Month.trim(),
    High: +High.replace('°F', '').trim(),
    Temp: +Temp.replace('°F', '').trim(),
    Low: +Low.replace('°F', '').trim(),
  });
}
// Ensure d

-[ ]ata parsing
console.log(data); // Debugging
