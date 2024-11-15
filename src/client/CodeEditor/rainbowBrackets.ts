import {
  EditorView,
  Decoration,
  ViewPlugin,
  showTooltip,
  Tooltip,
} from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';

function generateColors() {
  return ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
}

const updateColorsEffect = StateEffect.define();
const bracketColorsField = StateField.define({
  create: generateColors,
  update(colors, tr) {
    for (let effect of tr.effects) {
      if (effect.is(updateColorsEffect)) return effect.value;
    }
    return colors;
  },
});

const rainbowBracketsPlugin = ViewPlugin.fromClass(
  class {
    decorations;
    tooltip;
    constructor(view) {
      this.decorations = this.getBracketDecorations(view);
      this.tooltip = null;
    }

    update(update) {
      if (
        update.docChanged ||
        update.selectionSet ||
        update.viewportChanged
      ) {
        this.decorations = this.getBracketDecorations(update.view);
        this.updateTooltip(update.view);
      }
    }

    getBracketDecorations(view) {
      const { doc } = view.state;
      const decorations = [];
      const stack = [];
      const colors = view.state.field(bracketColorsField);

      for (let pos = 0; pos < doc.length; pos += 1) {
        const char = doc.sliceString(pos, pos + 1);
        if (char === '(' || char === '[' || char === '{') {
          stack.push({ type: char, from: pos });
        } else if (char === ')' || char === ']' || char === '}') {
          const open = stack.pop();
          if (open && open.type === this.getMatchingBracket(char)) {
            const color = colors[stack.length % colors.length];
            decorations.push(
              Decoration.mark({
                class: `rainbow-bracket-${color}`,
              }).range(open.from, open.from + 1),
              Decoration.mark({
                class: `rainbow-bracket-${color}`,
              }).range(pos, pos + 1),
            );
          } else {
            decorations.push(
              Decoration.mark({
                class: 'unmatched-bracket',
              }).range(pos, pos + 1),
            );
          }
        }
      }

      stack.forEach(unmatched => {
        decorations.push(
          Decoration.mark({
            class: 'unmatched-bracket',
          }).range(unmatched.from, unmatched.from + 1),
        );
      });

      return Decoration.set(decorations);
    }

    updateTooltip(view) {
      const { doc } = view.state;
      const pos = view.state.selection.main.head;
      const char = doc.sliceString(pos - 1, pos);
      if (char === '(' || char === '[' || char === '{') {
        this.tooltip = this.createBracketTooltip(view, pos - 1, char);
      } else if (char === ')' || char === ']' || char === '}') {
        this.tooltip = this.createBracketTooltip(view, pos - 1, char);
      } else {
        this.tooltip = null;
      }
    }

    createBracketTooltip(view, pos, char) {
      const matchPos = this.findMatchingBracket(view.state.doc, pos, char);
      if (matchPos !== null) {
        return showTooltip.of({
          pos,
          above: true,
          create: () => {
            const dom = document.createElement('div');
            dom.textContent = `Matches at ${matchPos}`;
            return { dom };
          },
        });
      }
      return null;
    }

    findMatchingBracket(doc, pos, char) {
      const matchingChar = this.getMatchingBracket(char);
      let balance = char === '(' || char === '[' || char === '{' ? 1 : -1;
      const step = balance === 1 ? 1 : -1;

      for (let i = pos + step; i >= 0 && i < doc.length; i += step) {
        const currentChar = doc.sliceString(i, i + 1);
        if (currentChar === char) balance++;
        if (currentChar === matchingChar) balance--;
        if (balance === 0) return i;
      }
      return null;
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
