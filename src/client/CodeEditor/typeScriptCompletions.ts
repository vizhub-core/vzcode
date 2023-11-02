import { CompletionSource } from '@codemirror/autocomplete';

export const typeScriptCompletions = ({
  typeScriptWorker,
  fileName,
}): CompletionSource => {
  // TODO finish this part
  // @ts-ignore
  const tsComplete: CompletionSource = async (ctx) => {
    //Post message to our sharedWorker to get completions.
    typeScriptWorker.postMessage({
      event: 'autocomplete-request',
      // Cursor position (integer, like index in a string)
      pos: ctx.pos,

      // Location is the file path (string)
      location: fileName,
      //   text: text,
    });

    // //An async promise to ensure that we are getting our completion entries
    // const completionsPromise = new Promise((resolve) => {
    //   typeScriptWorker.onmessage = (e) => {
    //     const tsCompletions = e.data.detail;
    //     resolve(tsCompletions);
    //   };
    // });
  };
  return tsComplete;
};

// // displays autocompletes
// async function tsComplete(ctx) {

//     const tsCompletions = await completionsPromise;
//     if (!tsCompletions) {
//       console.log('Unable to get completions');
//       return { from: ctx.pos, options: [] };
//     }

//     //Logic to get the text and cursor location in between punctuation.
//     //Taken from https://codemirror.net/examples/autocompletion/
//     const from = ctx.matchBefore(/\w*/).from;
//     const lastWord = ctx.matchBefore(/\w*/).text;
//     if (lastWord) {
//       // @ts-ignore
//       tsCompletions.entries = tsCompletions.entries.filter(
//         (completion) =>
//           completion.name.startsWith(lastWord),
//       );
//     }

//     return {
//       from: ctx.pos,
//       // @ts-ignore
//       options: tsCompletions.entries.map((completion) => ({
//         label: completion.name,
//         //Applies autocorrections to be seen in the code Editor
//         apply: (view) => {
//           view.dispatch({
//             changes: {
//               from,
//               to: ctx.pos,
//               insert: completion.name,
//             },
//           });
//         },
//       })),
//     };
//   }
