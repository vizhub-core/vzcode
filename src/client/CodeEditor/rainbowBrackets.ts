import {
  EditorView,
  Decoration,
  ViewPlugin,
} from '@codemirror/view';

function generateColors() {
  return ['red', 'orange', 'yellow', 'green'];
}

const rainbowBracketsPlugin = ViewPlugin.fromClass(
  class {
    decorations;

    constructor(view) {
      this.decorations = this.getBracketDecorations(view);
    }

    update(update) {
      if (
        update.docChanged ||
        update.selectionSet ||
        update.viewportChanged
      ) {
        this.decorations = this.getBracketDecorations(
          update.view,
        );
      }
    }

    getBracketDecorations(view) {
      const { doc } = view.state;
      const decorations = [];
      const stack = [];
      const colors = generateColors();

      for (let pos = 0; pos < doc.length; pos += 1) {
        const char = doc.sliceString(pos, pos + 1);
        if (char === '(' || char === '[' || char === '{') {
          stack.push({ type: char, from: pos });
        } else if (
          char === ')' ||
          char === ']' ||
          char === '}'
        ) {
          const open = stack.pop();
          if (
            open &&
            open.type === this.getMatchingBracket(char)
          ) {
            const color =
              colors[stack.length % colors.length];
            decorations.push(
              Decoration.mark({
                class: `rainbow-bracket-${color}`,
              }).range(open.from, open.from + 1),
              Decoration.mark({
                class: `rainbow-bracket-${color}`,
              }).range(pos, pos + 1),
            );
          }
        }
      }

      decorations.sort(
        (a, b) =>
          a.from - b.from || a.startSide - b.startSide,
      );

      return Decoration.set(decorations);
    }

    // eslint-disable-next-line class-methods-use-this
    getMatchingBracket(closingBracket) {
      switch (closingBracket) {
        case ')':
          return '(';
        case ']':
          return '[';
        case '}':
          return '{';
        default:
          return null;
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  },
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
