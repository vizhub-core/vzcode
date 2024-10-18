import {
  EditorView,
  Decoration,
  ViewPlugin,
} from '@codemirror/view';

// Generates the rainbow bracket colors
function generateColors() {
  return ['red', 'orange', 'yellow', 'green'];
}

// Create the plugin for rainbow brackets
const rainbowBracketsPlugin = (isEnabled: boolean) =>
  ViewPlugin.fromClass(
    class {
      decorations;

      constructor(view) {
        // Apply decorations based on whether rainbow brackets are enabled or not
        this.decorations = this.getBracketDecorations(
          view,
          isEnabled,
        );
      }

      update(update) {
        if (
          update.docChanged ||
          update.selectionSet ||
          update.viewportChanged
        ) {
          this.decorations = this.getBracketDecorations(
            update.view,
            isEnabled,
          );
        }
      }

      getBracketDecorations(view, isEnabled) {
        const { doc } = view.state;
        const decorations = [];
        const stack = [];
        const colors = generateColors();

        // Traverse the document for matching brackets
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
              // Choose rainbow color if enabled, otherwise fall back to default theme color
              const color = isEnabled
                ? colors[stack.length % colors.length]
                : 'default-bracket'; // 'default-bracket' should map to the theme's color
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

      // Helper to match opening and closing brackets
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

export default function rainbowBrackets(isEnabled: boolean) {
  return [
    rainbowBracketsPlugin(isEnabled),
    // Default base theme for rainbow brackets, including the fallback 'default-bracket' class
    EditorView.baseTheme({
      '.rainbow-bracket-red': { color: 'red' },
      '.rainbow-bracket-orange': { color: 'orange' },
      '.rainbow-bracket-yellow': { color: 'yellow' },
      '.rainbow-bracket-green': { color: 'green' },
      '.default-bracket': {
        color: 'var(--theme-bracket-color)',
      },
    }),
  ];
}
