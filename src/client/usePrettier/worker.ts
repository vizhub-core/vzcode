// import { build } from './build';
// importScripts("https://unpkg.com/prettier@3.0.2/standalone.js");
// importScripts("https://unpkg.com/prettier@3.0.2/plugins/graphql.js");

// (async () => {
//   const formatted = await prettier.format("type Query { hello: String }", {
//     parser: "graphql",
//     plugins: prettierPlugins,
//   });
// })();
import { format } from 'prettier/standalone';
import * as prettierPluginBabel from 'prettier/plugins/babel';
import * as prettierPluginEstree from 'prettier/plugins/estree';

// import prettierPlugins from 'prettier/parser-babel';
// import prettier from 'prettier/standalone';
// import parserBabel from 'prettier/plugins/babel';
// import parserHTML from 'prettier/parser-html';
// import parserCSS from 'prettier/parser-postcss';
// import parserMD from 'prettier/parser-markdown';

// export const plugins = [parserBabel, parserHTML, parserCSS, parserMD];

onmessage = async ({ data }: { data: string }) => {
  const result = await format(data, {
    parser: 'babel',
    plugins: [prettierPluginBabel, prettierPluginEstree],
  });
  console.log(result);
  postMessage('test');
};
