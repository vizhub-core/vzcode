import { VizFile } from '../../types';

const maxFileNameLength = 100;
const maxFileTextLength = 2000;

// Formats a file for the prompt.
export const formatFile = (
  file: VizFile,
  truncateText = true,
) => {
  const nameTruncated = file.name
    ?.substring(0, maxFileNameLength)
    .trim();

  const textTruncated = (
    truncateText
      ? file.text?.substring(0, maxFileTextLength)
      : file.text
  ).trim();

  return [
    '`' + nameTruncated + '`:',
    '```',
    textTruncated,
    '```',
  ].join('\n');
};
