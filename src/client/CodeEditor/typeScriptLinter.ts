import { generateRequestId } from './typeScriptCompletions';
import {
  LinterResponse,
  LinterRequest,
} from '../useTypeScript/requestTypes';
import ts from 'typescript';

export const typeScriptLinter = ({
  typeScriptWorker,
  fileName,
}) => {
  return async () => {
    const requestId = generateRequestId();
    const linterRequest: LinterRequest = {
      event: 'lint-request',
      fileName,
      requestId,
    };
    typeScriptWorker.postMessage(linterRequest);

    //An array of diagnostic (CodeMirror) objects.
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
    return tsErrors;
  };
};
