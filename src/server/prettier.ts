import { format } from 'prettier/standalone';
import * as prettierPluginBabel from 'prettier/plugins/babel';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettierPluginMarkdown from 'prettier/plugins/markdown';
import * as prettierPluginCSS from 'prettier/plugins/postcss';
import * as prettierPluginTypescript from 'prettier/plugins/typescript';
import { VizFiles, VizFileId } from '@vizhub/viz-types';

// Parser mappings - matches client-side implementation
const parsers = {
  js: 'babel',
  jsx: 'babel',
  mjs: 'babel',
  cjs: 'babel',
  ts: 'typescript',
  tsx: 'typescript',
  css: 'css',
  html: 'html',
  json: 'json',
  json5: 'json5',
  md: 'markdown',
  markdown: 'markdown',
} as const;

// Prettier plugins - matches client-side implementation
const plugins = [
  prettierPluginBabel,
  prettierPluginEstree,
  prettierPluginHtml,
  prettierPluginMarkdown,
  prettierPluginTypescript,
  prettierPluginCSS,
] as any;

// Prettier options - matches client-side implementation and .prettierrc
const prettierOptions = {
  proseWrap: 'always' as const,
  singleQuote: true,
  printWidth: 60,
};

/**
 * Extracts file extension from filename
 * Example: 'foo.js' => 'js'
 */
const getFileExtension = (fileName: string): string => {
  const match = fileName.match(/\.([^.]+)$/);
  return match ? match[1] : '';
};

/**
 * Formats a single file using Prettier
 */
export const formatFile = async (
  fileText: string,
  fileName: string,
): Promise<string | null> => {
  const fileExtension = getFileExtension(fileName);
  const parser =
    parsers[fileExtension as keyof typeof parsers];

  // If no parser is found, return null (no formatting)
  if (!parser) {
    return null;
  }

  try {
    const formatted = await format(fileText, {
      parser,
      plugins,
      ...prettierOptions,
    });
    return formatted;
  } catch (error) {
    // Log error but don't throw - return original text
    console.error(
      `Prettier formatting error for ${fileName}:`,
      error,
    );
    return null;
  }
};

/**
 * Formats multiple files using Prettier
 * Only formats files that have supported extensions
 * Returns a map of fileId -> formatted text for successfully formatted files
 */
export const formatFiles = async (
  files: VizFiles,
  fileIds?: VizFileId[],
): Promise<{ [fileId: VizFileId]: string }> => {
  const results: { [fileId: VizFileId]: string } = {};
  const targetFileIds = fileIds || Object.keys(files);

  // Process files in parallel for better performance
  const formatPromises = targetFileIds.map(
    async (fileId) => {
      const file = files[fileId];
      if (!file) return;

      const formatted = await formatFile(
        file.text,
        file.name,
      );
      if (formatted !== null && formatted !== file.text) {
        results[fileId] = formatted;
      }
    },
  );

  await Promise.all(formatPromises);
  return results;
};
