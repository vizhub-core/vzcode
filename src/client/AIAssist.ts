import { EditorView, keymap } from '@codemirror/view';

export const AIAssist = ({
  // The file id of the file the AI should assist with.
  fileId,

  // Optional endpoint override.
  aiAssistEndpoint = '/AIAssist',

  // Optional additional options to pass to the endpoint.
  aiAssistOptions = {},
}: {
  fileId: string;
  aiAssistEndpoint: string;
  aiAssistOptions?: {
    [key: string]: any;
  };
}) =>
  keymap.of([
    {
      key: 'control-m',
      run: (view: EditorView) => {
        const textToSend = view.state.sliceDoc(
          0,
          view.state.selection.main.to,
        );

        fetch(aiAssistEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Pass additional options to the AI Assist endpoint.
            ...aiAssistOptions,

            text: textToSend,
            fileId,
            cursorLocation: view.state.selection.main.to,
          }),
        });

        return true;
      },
    },
  ]);
