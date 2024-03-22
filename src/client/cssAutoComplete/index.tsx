import {CompletionContext} from "@codemirror/autocomplete"

//Basic starter code from online - will ltry to tweak this to fit our needs
function myCompletions(context: CompletionContext) {
  let word = context.matchBefore(/\w*/)
  if (word.from == word.to && !context.explicit)
    return null
  return {
    from: word.from,
    options: [
      {label: "match", type: "keyword"},
      {label: "hello", type: "variable", info: "(World)"},
      {label: "magic", type: "text", apply: "⠁⭒*.✩.*⭒⠁", detail: "macro"}
    ]
  }
}

function myCompletionsUpdated(context: CompletionContext) {
  let word = context.matchBefore(/\w*/);

  // Check if the cursor is at the beginning of the line and not explicitly triggered
  if (word.from === word.to && !context.explicit) {
    // If cursor is at the beginning of the line, provide indentation-related completions
    return {
      from: word.from,
      options: [
        { label: "if", type: "keyword" },
        { label: "for", type: "keyword" },
        { label: "while", type: "keyword" }
        // Add more indentation-related completions here
      ]
    };
  }

  // If cursor is not at the beginning of the line or it's explicitly triggered, provide regular completions
  return {
    from: word.from,
    options: [
      { label: "match", type: "keyword" },
      { label: "hello", type: "variable", info: "(World)" },
      { label: "magic", type: "text", apply: "⠁⭒*.✩.*⭒⠁", detail: "macro" }
      // Add more regular completions here
    ]
  };
}
