import { format } from 'prettier/standalone';
import * as prettierPluginBabel from 'prettier/plugins/babel';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettierPluginMarkdown from 'prettier/plugins/markdown';
// import * as prettierPluginYaml from 'prettier/plugins/yaml';
// import * as prettierPluginGraphql from 'prettier/plugins/graphql';
// import * as prettierPluginAngular from 'prettier/plugins/angular';
import * as prettierPluginTypescript from 'prettier/plugins/typescript';

import { FileId } from '../../types';

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
};

const plugins = [
  prettierPluginBabel,
  prettierPluginEstree,
  prettierPluginHtml,
  prettierPluginMarkdown,
  prettierPluginTypescript,
  //   prettierPluginYaml,
  //   prettierPluginGraphql,
  //   prettierPluginAngular,
  //   prettierPluginVue,
];

onmessage = async ({
  data,
}: {
  data: {
    // The text content of the file
    fileText: string;

    // The file extension
    // Supported extensions: https://prettier.io/docs/en/options.html#parser
    // VizHub only supports
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
    const fileTextPrettified = await format(fileText, { parser, plugins });

    postMessage({
      fileId,
      fileTextPrettified,
    });
  } catch (error) {
    postMessage({
      fileId,
      error,
    });
  }
};
