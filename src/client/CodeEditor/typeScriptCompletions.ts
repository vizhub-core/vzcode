import {
  CompletionContext,
  CompletionSource,
} from '@codemirror/autocomplete';

export const typeScriptCompletions = ({
  typeScriptWorker,
  fileName,
}): CompletionSource => {
  const tsComplete: CompletionSource = async (
    completionContext: CompletionContext,
  ) => {
    // A random unique ID for this request.
    const requestId = (Math.random() + '').slice(2);

    const fileContent =
      completionContext.state.doc.toString();

    //Post message to our sharedWorker to get completions.
    typeScriptWorker.postMessage({
      event: 'autocomplete-request',

      // Location is the file path (string)
      fileName,

      // Latest file content (string)
      fileContent,

      // Cursor position (integer, like index in a string)
      position: completionContext.pos,

      // Unique ID for this request
      requestId,
    });

    //An async promise to ensure that we are getting our completion entries
    const tsCompletions = await new Promise((resolve) => {
      typeScriptWorker.onmessage = ({ data }) => {
        if (
          data.event === 'post-completions' &&
          data.requestId === requestId
        ) {
          resolve(data.completions);
        }
      };
    });

    if (!tsCompletions) {
      // console.log('Unable to get completions');
      return { from: completionContext.pos, options: [] };
    }

    // Logic to get the text and cursor location in between punctuation.
    // Taken from https://codemirror.net/examples/autocompletion/
    // Also inspired by
    // https://stackblitz.com/edit/codemirror-6-typescript?file=client%2Findex.ts%3AL86
    const from = completionContext.matchBefore(/\w*/).from;

    // `lastWord` represents the word that the user has partially typed
    // and is currently at the end of the text, immediately before
    // the cursor position.
    const lastWord =
      completionContext.matchBefore(/\w*/).text;
    if (lastWord) {
      // @ts-ignore
      tsCompletions.entries = tsCompletions.entries.filter(
        (completion) =>
          completion.name.startsWith(lastWord),
      );
    }

    return {
      from: completionContext.pos,
      // @ts-ignore
      options: tsCompletions.entries.map((completion) => ({
        label: completion.name,
        // Applies autocompletions to be seen in the code Editor
        apply: (view) => {
          view.dispatch({
            changes: {
              from,
              to: completionContext.pos,
              insert: completion.name,
            },
          });
        },
      })),
    };
  };
  return tsComplete;
};
