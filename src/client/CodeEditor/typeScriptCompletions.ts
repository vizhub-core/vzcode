import { CompletionSource } from '@codemirror/autocomplete';

export const typeScriptCompletions = ({
  typeScriptWorker,
  fileName,
}): CompletionSource => {
  const tsComplete: CompletionSource = async (ctx) => {
    // A unique ID for this request.
    const requestId = Math.random() + '';

    //Post message to our sharedWorker to get completions.
    typeScriptWorker.postMessage({
      event: 'autocomplete-request',
      // Cursor position (integer, like index in a string)
      pos: ctx.pos,

      // Location is the file path (string)
      location: fileName,
      requestId,
      //   text: text,
    });

    //An async promise to ensure that we are getting our completion entries
    const tsCompletions = await new Promise((resolve) => {
      typeScriptWorker.onmessage = ({ data }) => {
        if (data.detail.requestId === requestId) {
          const tsCompletions = data.detail.completions;
          resolve(tsCompletions);
        }
      };
    });

    if (!tsCompletions) {
      console.log('Unable to get completions');
      return { from: ctx.pos, options: [] };
    }

    // Logic to get the text and cursor location in between punctuation.
    // Taken from https://codemirror.net/examples/autocompletion/
    // Also inspired by
    // https://stackblitz.com/edit/codemirror-6-typescript?file=client%2Findex.ts%3AL86
    const from = ctx.matchBefore(/\w*/).from;
    const lastWord = ctx.matchBefore(/\w*/).text;
    if (lastWord) {
      // @ts-ignore
      tsCompletions.entries = tsCompletions.entries.filter(
        (completion) =>
          completion.name.startsWith(lastWord),
      );
    }

    return {
      from: ctx.pos,
      // @ts-ignore
      options: tsCompletions.entries.map((completion) => ({
        label: completion.name,
        // Applies autocompletions to be seen in the code Editor
        apply: (view) => {
          view.dispatch({
            changes: {
              from,
              to: ctx.pos,
              insert: completion.name,
            },
          });
        },
      })),
    };
  };
  return tsComplete;
};
