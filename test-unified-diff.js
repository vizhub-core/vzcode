import { generateFileDiff, generateUnifiedDiff } from './src/utils/fileDiff.js';

// Test the new unified diff generation
const beforeContent = 'console.log("Hello, World!");';
const afterContent = '// Welcome to my visualization\nconsole.log("Hello, World!");';

const fileDiff = generateFileDiff('file1', 'index.js', beforeContent, afterContent);
const filesDiff = { 'file1': fileDiff };

console.log('Generated FileDiff:');
console.log('hasChanges:', fileDiff.hasChanges);
console.log('lines count:', fileDiff.lines.length);
fileDiff.lines.forEach((line, i) => {
  console.log(`  ${i}: ${line.type} - "${line.content}"`);
});

console.log('\nGenerated Unified Diff:');
const unifiedDiff = generateUnifiedDiff(filesDiff);
console.log(unifiedDiff);