import { generateRequestId } from './typeScriptCompletions';
import { LinterResponse } from '../useTypeScript/requestTypes';
import ts from 'typescript';

export const typeScriptLinter = ({
  typeScriptWorker,
  fileName,
  text,
}) => {
  return async () => {
    const requestId = generateRequestId();
    typeScriptWorker.postMessage({
      event: 'lint-request',
      fileName,
      fileContent: text,
      requestId,
    });
    //Make sure we are getting the correct postMessage from web worker
    const tsErrors: ts.Diagnostic[] = await new Promise(
      (resolve) => {
        typeScriptWorker.onmessage = (message: {
          data: LinterResponse;
        }) => {
          const ErrorData: LinterResponse = message.data;
          const { event, requestId, tsErrors } = ErrorData;
          if (
            event === 'post-error-linter' &&
            requestId === requestId
          ) {
            resolve(tsErrors);
          }
        };
      },
    );
    console.log('Errors received!');
    //Inspired by: https://stackblitz.com/edit/codemirror-6-typescript?file=client%2Findex.ts%3AL44-L44
    return tsErrors;

  };
};
