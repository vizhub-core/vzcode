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
        if (
          shareDBDoc.data.aiStreams == null ||
          shareDBDoc.data.aiStreams[mostRecentStreamId] ==
            null ||
          shareDBDoc.data.aiStreams[mostRecentStreamId]
            ?.AIStreamStatus.serverIsRunning !== true
        ) {
          startAIAssist(view, shareDBDoc, fileId);
        } else {
          haltAIAssist(shareDBDoc);
        }

        return true;
      },
    },
  ]);

export let mostRecentStreamId = null;

export const startAIAssist = (
  view: EditorView,
  shareDBDoc: ShareDBDoc<VZCodeContent>,
  fileId: FileId,
) => {
  const textToSend = view.state.sliceDoc(
    0,
    view.state.selection.main.to,
  );

  mostRecentStreamId = generateRequestId();

  if (shareDBDoc.data['aiStreams'] === undefined) {
    shareDBDoc.submitOp(insertOp(['aiStreams'], {}), {
      source: 'AIClient',
    });
  }

  shareDBDoc.submitOp(
    insertOp(['aiStreams', mostRecentStreamId], {
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

export const haltAIAssist = (shareDBDoc) => {
  const haltGenerationOp = replaceOp(
    [
      'aiStreams',
      mostRecentStreamId,
      'AIStreamStatus',
      'clientWantsToStart',
    ],
    true,
    false,
  );

  shareDBDoc.submitOp(haltGenerationOp, {
    source: 'AIClient',
  });
};
