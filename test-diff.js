import { diffLines } from "diff";

const oldText = `line1
line2
line3
line4
line5
line6`;

const newText = `line1
line2
line3 changed
line4
line5
line6`;

const changes = diffLines(oldText, newText);

console.log('Raw diff output:');
changes.forEach((part, index) => {
  console.log(`${index}: ${JSON.stringify(part)}`);
});

const CONTEXT = 1; // how many unchanged lines to keep around changes
let output = [];
let buffer = [];

changes.forEach(part => {
  if (part.added || part.removed) {
    // flush buffered context if hidden
    if (buffer.length > 0) {
      output.push("...");
      buffer = [];
    }
    output.push(part.value.trimEnd());
  } else {
    const lines = part.value.split("\n").filter(Boolean);
    if (lines.length > CONTEXT * 2) {
      // keep start + end context, collapse middle
      buffer.push(...lines.slice(0, CONTEXT), "...", ...lines.slice(-CONTEXT));
    } else {
      buffer.push(...lines);
    }
  }
});

output = output.concat(buffer);
console.log('\nProcessed output:');
console.log(output.join("\n"));