import {
    CompletionContext,
    CompletionSource,
  } from '@codemirror/autocomplete';
  
  export const htmlCompletions = (): CompletionSource => {
    const htmlComplete: CompletionSource = async (
      completionContext: CompletionContext,
    ) => {
      const fileContent = completionContext.state.doc.toString();
  
      //Prevent completions from appearing on certain characters
      const lastCharacter = fileContent[completionContext.pos - 1];
      if (
        [
          '"',
          "'",
          ';',
          '(',
          ')',
          '{',
          ',',
          ' ',
          '=',
          '<',
          '>',
        ].includes(lastCharacter)
      ) {
        return { from: completionContext.pos, options: [] };
      }
  
      // HTML tags for autocompletion
      const htmlTags = [
        'div',
        'span',
        'p',
        'a',
        'img',
        'script',
        'style',
        // ... add more HTML tags here
      ];
  
      // `lastWord` represents the word that the user has partially typed
      // and is currently at the end of the text, immediately before
      // the cursor position.
      const lastWord = completionContext.matchBefore(/\w*/).text;
  
      let completions = [];
      if (lastWord) {
        completions = htmlTags.filter((tag) =>
          tag.startsWith(lastWord),
        );
      }
  
      return {
        from: completionContext.pos,
        options: completions.map((completion) => ({
          label: completion,
          apply: (view) => {
            const newPosition =
              completionContext.pos +
              completion.length -
              lastWord.length;
            view.dispatch({
              changes: {
                from: completionContext.pos,
                to: completionContext.pos,
                insert: completion,
              },
              selection: {
                anchor: newPosition,
                head: newPosition,
              },
            });
          },
        })),
      };
    };
    return htmlComplete;
  };