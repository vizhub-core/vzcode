import { EditorView, keymap } from '@codemirror/view';
import {
  FileId,
  File,
  ShareDBDoc,
  VZCodeContent,
} from '../types';
import { generateRequestId } from './CodeEditor/typeScriptCompletions';
import { insertOp, replaceOp } from 'ot-json1';

import { TabState } from './vzReducer';

export const AIAssist = ({
  shareDBDoc,
  // The file id of the file the AI should assist with.
  fileId,
  tabList,

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
  tabList: Array<TabState>;
}) =>
  keymap.of([
    {
      key: 'control-m',
      run: (view: EditorView) => {
        if (
          shareDBDoc.data.aiStreams === undefined ||
          shareDBDoc.data.aiStreams[mostRecentStreamId] ===
            null ||
          shareDBDoc.data.aiStreams[mostRecentStreamId]
            ?.AIStreamStatus.serverIsRunning !== true
        ) {
          startAIAssist(view, shareDBDoc, fileId, tabList);
        } else {
          haltAIAssist(shareDBDoc);
        }

        return true;
      },
    },
  ]);

// TODO use ref forwarding instead of `export let`
export let mostRecentStreamId = null;

export const startAIAssist = async (
  view: EditorView,
  shareDBDoc: ShareDBDoc<VZCodeContent>,
  fileId: FileId,
  tabList: Array<TabState>,
  // TODO mostRecentStreamIdRef: React.MutableRefObject<string>,
) => {
  const textToSend =
    (await generateFilesContext(
      tabList.map(
        (tabState) =>
          shareDBDoc.data.files[tabState.fileId],
      ),
    )) +
    'Current File:\n' +
    view.state.sliceDoc(0, view.state.selection.main.to);

  console.log(textToSend);

  // TODO mostRecentStreamIdRef.current = generateRequestId();
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

export const haltAIAssist = (
  shareDBDoc: ShareDBDoc<VZCodeContent>,
) => {
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

export const generateFilesContext = async (
  goodFiles: File[],
): Promise<string> => {
  const input = goodFiles
    .map((file) => {
      const nameSubstring = file.name
        // ?.substring(0, maxFileNameLength)
        .trim();

      const textSubstring = file.text
        // ?.substring(0, maxFileTextLength)
        .trim();

      // Generate Markdown that AI will understand.
      return `File \`${nameSubstring}\`:\n\`\`\`${textSubstring}\`\`\``;
    })
    .join('\n\n');

  return input;
};
