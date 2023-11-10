import { generateRequestId } from './typeScriptCompletions';
import {
  LinterResponse,
  LinterRequest,
} from '../useTypeScript/requestTypes';
import ts from 'typescript';

export const typeScriptLinter = ({
  typeScriptWorker,
  fileName,
    shareDBDoc,
    fileId
}) => {
  return async () => {
    const requestId = generateRequestId();
    //Get the fileContent from shareDB to pass to web worker
    const fileContent = shareDBDoc.data.files[fileId].text;
    const linterRequest: LinterRequest = {
      event: 'lint-request',
      fileName,
      fileContent,
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
    return tsErrors;
  };
};
