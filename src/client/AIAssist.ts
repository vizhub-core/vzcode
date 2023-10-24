import { EditorView, keymap } from '@codemirror/view';

export const AIAssist = keymap.of([
  {
    key: 'control-m',
    run: (view: EditorView) => {
      console.log('Triggering ML from Open AI');
      console.log(view.state.selection.main.to);
      const textToSend = view.state.sliceDoc(
        0,
        view.state.selection.main.to,
      );
      console.log(textToSend);

      fetch('/AIAssist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToSend }),
      });

      return true;
    },
  },
]);
