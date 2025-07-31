// Quick test to understand diff2html API
import * as Diff2Html from 'diff2html';

// Test with sample diff data
const sampleDiff = `diff --git a/index.js b/index.js
index 1234567..abcdefg 100644
--- a/index.js
+++ b/index.js
@@ -1,3 +1,4 @@
+// Welcome to my visualization
 console.log("Hello, World!");
 
 // Some other code`;

console.log('Sample diff:', sampleDiff);
console.log('Diff2Html exports:', Object.keys(Diff2Html));

try {
  const diffHtml = Diff2Html.html(sampleDiff, { 
    drawFileList: false,
    matching: 'lines',
    outputFormat: 'side-by-side'
  });
  console.log('Generated HTML length:', diffHtml.length);
  console.log('HTML preview:', diffHtml.substring(0, 200) + '...');
} catch (error) {
  console.error('Error:', error.message);
}