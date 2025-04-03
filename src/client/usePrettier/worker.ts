import { format } from 'prettier/standalone';
import * as prettierPluginBabel from 'prettier/plugins/babel';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettierPluginMarkdown from 'prettier/plugins/markdown';
import * as prettierPluginCSS from 'prettier/plugins/postcss';
import * as prettierPluginTypescript from 'prettier/plugins/typescript';
import * as prettierPluginSvelte from 'prettier-plugin-svelte/browser';

import { VizFileId } from '../../types';

const enableSvelte = true;

const parsers = {
  js: 'babel',
  jsx: 'babel',
  mjs: 'babel',
  cjs: 'babel',
  ts: 'typescript',
  tsx: 'typescript',
  css: 'css',
  //   '.less': 'less',
  //   '.scss': 'scss',
  html: 'html',
  json: 'json',
  json5: 'json5',
  md: 'markdown',
  markdown: 'markdown',
  //   '.vue': 'vue',
};

if (enableSvelte) {
  // @ts-ignore
  parsers.svelte = 'svelte';
}

const plugins = [
  prettierPluginBabel,
  prettierPluginEstree,
  prettierPluginHtml,
  prettierPluginMarkdown,
  prettierPluginTypescript,
  prettierPluginCSS,
];

if (enableSvelte) {
  // @ts-ignore
  plugins.push(prettierPluginSvelte);
}

onmessage = async ({
  data,
}: {
  data: {
    // The text content of the file
    fileText: string;

    // The file extension
    // Supported extensions: https://prettier.io/docs/en/options.html#parser
    // The editor only supports
    // - JavaScript
    // - TypeScript
    // - HTML
    // - CSS
    // - JSON
    // - Markdown

    fileExtension: string;

    // The file id
    fileId: VizFileId;
  };
}) => {
  const { fileExtension, fileText, fileId } = data;
  const parser = parsers[fileExtension];

  // If no parser is found, just do nothing.
  // For example, if the user opens a CSV file,
  // then we don't want to run Prettier on it,
  // and we also don't want to show an error.
  if (!parser) {
    return;
  }

  try {
    const fileTextPrettified = await format(fileText, {
      parser,
      plugins,

      // This helps with Markdown files
      proseWrap: 'always',

      // Opinionated code style for JavaScript
      singleQuote: true,
      printWidth: 60,
    });

    postMessage({
      fileId,
      fileTextPrettified,
    });
  } catch (error) {
    console.error(error);
    postMessage({
      fileId,
      error: error.toString(),
    });
  }
};
