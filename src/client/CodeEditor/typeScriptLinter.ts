import type { Diagnostic } from 'typescript';
import { generateRequestId } from '../generateRequestId';
import {
  LinterRequest,
  LinterResponse,
} from '../useTypeScript/worker/requestTypes';

export const typeScriptLinter = ({
  typeScriptWorker,
  fileName,
  shareDBDoc,
  fileId,
  allowGlobals,
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
      allowGlobals,
    };
    typeScriptWorker.postMessage(linterRequest);

    //An array of diagnostic (CodeMirror) objects.
    const tsErrors: Diagnostic[] = await new Promise(
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
