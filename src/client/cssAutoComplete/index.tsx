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

//Sample context for testing
const context2: CompletionContext = {
  explicit: false,  
  matchBefore: (regex: RegExp) => {
    // match regex pattern
    const textBeforeCursor = "";  
    const match = textBeforeCursor.match(regex);  
    if (match) {
      return { from: match.index, to: match.index + match[0].length }; 
    } else {
      return { from: 0, to: 0 };  
    }
  }
};

const completions2 = myCompletions(context2);
console.log("Updated function completions:", completions2);
