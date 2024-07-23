import { EditorView } from 'codemirror';
import {
  File,
  FileId,
  ShareDBDoc,
  TabState,
  VZCodeContent,
} from '../../types';
import { RequestId } from '../generateRequestId';
import { formatFile } from './formatFile';

const debug = false;

// Enables inclusion of code from open tabs as context.
const enableTabContext = false;

const defaultAIAssistEndpoint = '/ai-assist';

export const startAIAssist = async ({
  view,
  shareDBDoc,
  fileId,
  tabList,
  aiAssistEndpoint = defaultAIAssistEndpoint,
  aiAssistOptions = {},
  aiStreamId,
}: {
  view: EditorView;
  shareDBDoc: ShareDBDoc<VZCodeContent>;
  fileId: FileId;
  tabList: Array<TabState>;
  aiAssistEndpoint?: string;
  aiAssistOptions?: {
    [key: string]: any;
  };
  aiStreamId: RequestId;
}) => {
  const currentFileName =
    shareDBDoc.data.files[fileId].name;

  // Generate a version of the current file with a
  // <FILL_ME> in the middle.
  const prefix = view.state.sliceDoc(
    0,
    view.state.selection.main.from,
  );
  const suffix = view.state.sliceDoc(
    view.state.selection.main.to,
  );
  const combinedText = prefix + '<FILL_ME>' + suffix;
  const currentFile = {
    name: currentFileName,
    text: combinedText,
  };

  const insertionCursor = view.state.selection.main.to;

  // The main prompt is the current file, plus the context files.
  let inputText = formatFile(currentFile, false);

  if (enableTabContext) {
    inputText +=
      '\n\n' +
      tabList
        .filter((tabState) => tabState.fileId !== fileId)
        .map((tabState) =>
          formatFile(
            shareDBDoc.data.files[tabState.fileId],
          ),
        )
        .join('\n\n');
  }

  if (debug) {
    // console.log('[startAIAssist] sending HTTP request:');
    // console.log(
    //   '[startAIAssist]   aiAssistEndpoint:',
    //   aiAssistEndpoint,
    // );
    // console.log(
    //   '[startAIAssist]   aiAssistOptions:',
    //   aiAssistOptions,
    // );
    console.log(
      '[startAIAssist]   inputText:\n`' + inputText + '`',
    );
    // console.log('[startAIAssist]   fileId:', fileId);
    // console.log(
    //   '[startAIAssist]   insertionCursor:',
    //   insertionCursor,
    // );
    // console.log(
    //   '[startAIAssist]   aiStreamId:',
    //   aiStreamId,
    // );
  }

  const response = await fetch(aiAssistEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...aiAssistOptions,
      inputText,
      fileId,
      insertionCursor,
      aiStreamId,
    }),
  });

  const responseJson = await response.json();

  if (responseJson.error) {
    console.error(
      '[startAIAssist] error from server:',
      responseJson.error,
    );
  }
};
