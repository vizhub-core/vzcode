import {
  EditorView,
  Decoration,
  ViewPlugin,
  DecorationSet,
} from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

// Helper function to generate a list of colors
function generateColors() {
  return ['red', 'orange', 'yellow', 'green'];
}

// Helper function to match opening brackets with their corresponding closing brackets
function getMatchingBracket(closingBracket) {
  const matchingBrackets = {
    ')': '(',
    ']': '[',
    '}': '{',
  };
  return matchingBrackets[closingBracket] || null;
}

// Helper function to create a decoration mark for a bracket
function createBracketDecoration(from, to, color) {
  return [
    Decoration.mark({ class: `rainbow-bracket-${color}` }).range(from, from + 1),
    Decoration.mark({ class: `rainbow-bracket-${color}` }).range(to, to + 1),
  ];
}

// Main plugin for handling rainbow brackets
const rainbowBracketsPlugin = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = this.getBracketDecorations(view);
    }

    update(update) {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = this.getBracketDecorations(update.view);
      }
    }

    getBracketDecorations(view) {
      const { doc } = view.state;
      const builder = new RangeSetBuilder();
      const stack = [];
      const colors = generateColors();

      for (let pos = 0; pos < doc.length; pos++) {
        const char = doc.sliceString(pos, pos + 1);

        if (['(', '[', '{'].includes(char)) {
          stack.push({ type: char, from: pos });
        } else if ([')', ']', '}'].includes(char)) {
          const open = stack.pop();
          if (open && open.type === getMatchingBracket(char)) {
            const color = colors[stack.length % colors.length];
            createBracketDecoration(open.from, pos, color).forEach(deco => builder.add(open.from, pos + 1, deco));
          }
        }
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

export default function rainbowBrackets() {
  return [
    rainbowBracketsPlugin,
    EditorView.baseTheme({
      '.rainbow-bracket-red': { color: 'white' },
      '.rainbow-bracket-red > span': { color: 'white' },
      '.rainbow-bracket-orange': { color: '#FFFFB2' },
      '.rainbow-bracket-orange > span': {
        color: '#FFFFB2',
      },
      '.rainbow-bracket-yellow': { color: '#FFB2DA' },
      '.rainbow-bracket-yellow > span': {
        color: '#FFB2DA',
      },
      '.rainbow-bracket-green': { color: '#B2FFB2' },
      '.rainbow-bracket-green > span': { color: '#B2FFB2' },
    }),
  ];
}
