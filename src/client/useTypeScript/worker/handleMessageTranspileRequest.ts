import ts from 'typescript';
import { compilerOptions } from './constants';

// Handle the transpile-request event, which
// transpiles TypeScript to JavaScript.
export const handleMessageTranspileRequest = async ({
  data,
}) => {
  const tsCode = data.tsCode;

  const jsCode = ts.transpileModule(tsCode, {
    compilerOptions: compilerOptions,
  }).outputText;

  postMessage({
    event: 'transpile-response',
    jsCode,
    fileId: data.fileId,
  });
};
