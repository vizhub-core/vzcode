import { format } from 'prettier/standalone';
import * as prettierPluginBabel from 'prettier/plugins/babel';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettierPluginMarkdown from 'prettier/plugins/markdown';
import * as prettierPluginCSS from 'prettier/plugins/postcss';
// import * as prettierPluginYaml from 'prettier/plugins/yaml';
// import * as prettierPluginGraphql from 'prettier/plugins/graphql';
// import * as prettierPluginAngular from 'prettier/plugins/angular';
import * as prettierPluginTypescript from 'prettier/plugins/typescript';

// This plugin refers to Buffer, which breaks in the browser.
import * as prettierPluginSvelte from 'prettier-plugin-svelte';
import { Buffer } from 'buffer';

globalThis.Buffer = Buffer;
import { FileId } from '../../types';

const enableSvelte = false;
// console.log('Buffer');
// console.log(Buffer);
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
  //   '.graphql': 'graphql',
  //   '.gql': 'graphql',
  md: 'markdown',
  markdown: 'markdown',
  //   '.yaml': 'yaml',
  //   '.yml': 'yaml',
  //   '.vue': 'vue',
  //   '.component.html': 'angular',
  svelte: 'svelte',
};

const plugins = [
  prettierPluginBabel,
  prettierPluginEstree,
  prettierPluginHtml,
  prettierPluginMarkdown,
  prettierPluginTypescript,
  prettierPluginCSS,
  prettierPluginSvelte,
];

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
    fileId: FileId;
  };
}) => {
  const { fileExtension, fileText, fileId } = data;
  const parser = parsers[fileExtension];

  if (!parser) {
    postMessage({
      fileId,
      error: `Unsupported file extension for Prettier: ${fileExtension}`,
    });
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
    postMessage({
      fileId,
      error: error.toString(),
    });
  }
};
