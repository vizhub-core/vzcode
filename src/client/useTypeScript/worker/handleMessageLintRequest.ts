import ts from 'typescript';
import type { Diagnostic } from '@codemirror/lint';
import {
  LinterRequest,
  LinterResponse,
} from './requestTypes';
import { getTSFileName } from './getTSFileName';
import { isTS } from './isTS';
import {
  LINT_ERROR_CODE_CANNOT_FIND_NAME,
  excludedErrorCodes,
} from './constants';

// Inspired by: https://stackblitz.com/edit/codemirror-6-typescript?file=client%2Findex.ts%3AL44-L44
const convertToCodeMirrorDiagnostic = (
  tsErrors: ts.Diagnostic[],
): Array<Diagnostic> =>
  tsErrors.map((tsError: ts.Diagnostic) => ({
    from: tsError.start,
    to: tsError.start + tsError.length,
    severity: 'error',
    message:
      typeof tsError.messageText === 'string'
        ? tsError.messageText
        : tsError.messageText.messageText,
  }));

export const handleMessageLintRequest = async ({
  debug,
  data,
  env,
  setFile,
}) => {
  if (debug) {
    console.log('Lint Request');
  }
  const linterRequest: LinterRequest = data;
  const { fileName, fileContent, requestId, allowGlobals } =
    linterRequest;

  const tsFileName = getTSFileName(fileName);
  let tsErrors = [];
  if (isTS(tsFileName) && fileContent !== '') {
    // We are updating the server with the latest content
    // when we autocomplete, so it's always up to date.
    setFile(tsFileName, fileContent);

    // Creates an array of diagnostic objects containing
    // both semantic and syntactic diagnostics.
    tsErrors = env.languageService
      .getSemanticDiagnostics(tsFileName)
      .concat(
        env.languageService.getSyntacticDiagnostics(
          tsFileName,
        ),
      );

    if (debug) {
      console.log('tsErrors');
      console.log(tsErrors);
    }

    tsErrors = tsErrors.filter(
      (error: { code: number }) => {
        if (
          allowGlobals &&
          error.code === LINT_ERROR_CODE_CANNOT_FIND_NAME
        ) {
          return false;
        }
        return !excludedErrorCodes.has(error.code);
      },
    );

    tsErrors = convertToCodeMirrorDiagnostic(tsErrors);
  }

  const linterResponse: LinterResponse = {
    event: 'post-error-linter',
    tsErrors,
    requestId,
  };
  postMessage(linterResponse);
};
