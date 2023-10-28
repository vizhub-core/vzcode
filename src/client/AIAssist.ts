import { EditorView, keymap } from '@codemirror/view';

export const AIAssist = (
  activeFileId: string,
  endpoint = '/AIAssist',
) =>
  keymap.of([
    {
      key: 'control-m',
      run: (view: EditorView) => {
        const textToSend = view.state.sliceDoc(
          0,
          view.state.selection.main.to,
        );

        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: textToSend,
            fileId: activeFileId,
            cursorLocation: view.state.selection.main.to,
          }),
        });

        return true;
      },
    },
  ]);
