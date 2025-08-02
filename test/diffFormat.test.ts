import { describe, it, expect } from 'vitest';
import * as Diff2Html from 'diff2html';

describe('DiffView format', () => {
  const sampleUnifiedDiff = `Index: test.js
--- test.js
+++ test.js
@@ -1,3 +1,3 @@
 function hello() {
-  console.log("Hello");
+  console.log("Hello, World!");
 }`;

  it('should use side-by-side format with matching none', () => {
    const diffHtml = Diff2Html.html(sampleUnifiedDiff, {
      drawFileList: false,
      matching: 'none',
      diffStyle: 'word',
      outputFormat: 'side-by-side',
    });

    // Check that the HTML contains side-by-side classes
    expect(diffHtml).toContain('d2h-file-side-diff');
    expect(diffHtml).toContain('d2h-files-diff');
  });

  it('should not use line-by-line format anymore', () => {
    const diffHtml = Diff2Html.html(sampleUnifiedDiff, {
      drawFileList: false,
      matching: 'none',
      diffStyle: 'word',
      outputFormat: 'side-by-side',
    });

    // Check that we're using side-by-side, not line-by-line
    expect(diffHtml).not.toContain('d2h-code-line ');
    expect(diffHtml).toContain('d2h-code-side-line');
  });
});