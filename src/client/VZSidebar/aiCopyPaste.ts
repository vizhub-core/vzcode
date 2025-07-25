import {
  formatMarkdownFiles,
  parseMarkdownFiles,
} from 'llm-code-format';
import {
  FORMAT_INSTRUCTIONS,
  mergeFileChanges,
} from 'editcodewithai';
import { VizFiles } from '@vizhub/viz-types';
import { vizFilesToFileCollection } from '@vizhub/viz-utils';

export const createAICopyPasteHandlers = (
  files: VizFiles,
  submitOperation: any,
  setCopyButtonText: (text: string) => void,
  setPasteButtonText: (text: string) => void,
) => {
  // Copy for AI - formats all files and copies to clipboard
  const handleCopyForAI = async () => {
    if (!files) return;

    try {
      const fileCollection =
        vizFilesToFileCollection(files);

      // Format files for AI consumption
      const formattedFiles =
        formatMarkdownFiles(fileCollection) +
        '\n\n' +
        FORMAT_INSTRUCTIONS.whole;

      // Copy to clipboard
      await navigator.clipboard.writeText(formattedFiles);

      // Show success feedback
      setCopyButtonText('Copied!');
      setTimeout(
        () => setCopyButtonText('Copy for AI'),
        2000,
      );
    } catch (error) {
      console.error('Failed to copy files for AI:', error);
      setCopyButtonText('Error');
      setTimeout(
        () => setCopyButtonText('Copy for AI'),
        2000,
      );
    }
  };

  // Paste for AI - parses clipboard content and updates files
  const handlePasteForAI = async () => {
    if (!submitOperation) return;

    try {
      // Read from clipboard
      const clipboardText =
        await navigator.clipboard.readText();

      // Handle various line endings
      const normalized = clipboardText.replace(
        /\r\n?/g,
        '\n',
      );

      if (!normalized.trim()) {
        setPasteButtonText('Empty clipboard');
        setTimeout(
          () => setPasteButtonText('Paste for AI'),
          2000,
        );
        return;
      }

      // Parse the markdown files format
      const parsed = parseMarkdownFiles(normalized, 'bold');

      if (
        parsed.files &&
        Object.keys(parsed.files).length > 0
      ) {
        // Use mergeFileChanges utility from editcodewithai
        const mergedFiles = mergeFileChanges(
          files,
          parsed.files,
        );

        // Update files using the submit operation
        submitOperation((document) => ({
          ...document,
          files: mergedFiles,
        }));

        const fileCount = Object.keys(parsed.files).length;
        setPasteButtonText('Pasted!');
        setTimeout(
          () => setPasteButtonText('Paste for AI'),
          2000,
        );
      } else {
        setPasteButtonText('No files found');
        setTimeout(
          () => setPasteButtonText('Paste for AI'),
          2000,
        );
      }
    } catch (error) {
      console.error(
        'Failed to paste files from AI:',
        error,
      );
      setPasteButtonText('Error');
      setTimeout(
        () => setPasteButtonText('Paste for AI'),
        2000,
      );
    }
  };

  return {
    handleCopyForAI,
    handlePasteForAI,
  };
};
