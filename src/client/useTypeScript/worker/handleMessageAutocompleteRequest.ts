import { getTSFileName } from './getTSFileName';
import { isTS } from './isTS';
import {
  AutocompleteRequest,
  AutocompleteResponse,
} from './requestTypes';

// This function is called when the worker receives a message with the type
// 'autocomplete-request'. It gets completions at the specified position in the
// file and sends them back to the main thread.
export const handleMessageAutocompleteRequest = async ({
  debug,
  data,
  env,
  setFile,
}) => {
  if (debug) {
    console.log('autocomplete-request message received');
  }

  // Should not happen.
  if (env === null) {
    console.log('env is null');
    return;
  }

  // Example of `data`:
  // {
  //   "event": "autocomplete-request",
  //   "pos": 8,
  //   "location": "index.js",
  //   "requestId": "0.9090605799171392"
  // }

  const autocompleteRequest: AutocompleteRequest = data;
  const { fileName, fileContent, position, requestId } =
    autocompleteRequest;

  const tsFileName = getTSFileName(fileName);

  let completions = null;
  if (isTS(tsFileName) && fileContent !== '') {
    // Update the file in the file system to the
    // absolute latest version. This is critical
    // for correct completions.
    setFile(tsFileName, fileContent);

    completions =
      env.languageService.getCompletionsAtPosition(
        tsFileName,
        position,
        {},
      );
  }

  const autocompleteResponse: AutocompleteResponse = {
    event: 'post-completions',
    completions,
    requestId,
  };

  postMessage(autocompleteResponse);
};
