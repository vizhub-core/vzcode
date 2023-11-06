import { EditorView, keymap } from '@codemirror/view';
import {
  FileId,
  ShareDBDoc,
  VZCodeContent,
} from '../types';
import { generateRequestId } from './CodeEditor/typeScriptCompletions';
import { insertOp, replaceOp } from 'ot-json1';

export const AIAssist = ({
  shareDBDoc,
  // The file id of the file the AI should assist with.
  fileId,

  // Optional endpoint override.
  aiAssistEndpoint = '/AIAssist',

  // Optional additional options to pass to the endpoint.
  aiAssistOptions = {},
}: {
  shareDBDoc: ShareDBDoc<VZCodeContent>;
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
        startAIAssist(view, shareDBDoc, fileId);
        // fetch(aiAssistEndpoint, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     // Pass additional options to the AI Assist endpoint.
        //     ...aiAssistOptions,

        //     text: textToSend,
        //     fileId,
        //     cursorLocation: view.state.selection.main.to,
        //   }),
        // });

        return true;
      },
    },

    {
      key: 'control-M',
      run: (view: EditorView) => {
        const haltGenerationOp = replaceOp(
          [
            'aiStreams',
            currentStreamId,
            'AIStreamStatus',
            'clientWantsToStart',
          ],
          true,
          false,
        );

        shareDBDoc.submitOp(haltGenerationOp, {
          source: 'AIClient',
        });
        return true;
      },
    },
  ]);

let currentStreamId = null;

export const startAIAssist = (
  view: EditorView,
  shareDBDoc: ShareDBDoc<VZCodeContent>,
  fileId: FileId,
) => {
  const textToSend = view.state.sliceDoc(
    0,
    view.state.selection.main.to,
  );

  currentStreamId = generateRequestId();

  console.log(shareDBDoc);

  if (shareDBDoc.data['aiStreams'] === undefined) {
    shareDBDoc.submitOp(insertOp(['aiStreams'], {}), {
      source: 'AIClient',
    });
  }
  console.log(shareDBDoc);

  shareDBDoc.submitOp(
    insertOp(['aiStreams', currentStreamId], {
      AIStreamStatus: {
        clientWantsToStart: true,
        serverIsRunning: false,
        text: textToSend,
        insertionCursor: view.state.selection.main.to,
        fileId: fileId,
      },
    }),
    { source: 'AIClient' },
  );
};
