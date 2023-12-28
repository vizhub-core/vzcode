import { EditorView } from 'codemirror';
import {
  FileId,
  ShareDBDoc,
  VZCodeContent,
} from '../../types';
import { TabState } from '../vzReducer';
import { generateFilesContext } from './generateFilesContext';
import {
  RequestId,
  generateRequestId,
} from '../generateRequestId';

const debug = false;

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
  const inputText =
    (await generateFilesContext(
      tabList.map(
        (tabState) =>
          shareDBDoc.data.files[tabState.fileId],
      ),
    )) +
    'Current File:\n' +
    view.state.sliceDoc(0, view.state.selection.main.to);

  const insertionCursor = view.state.selection.main.to;

  if (debug) {
    console.log('[startAIAssist] sending HTTP request:');
    console.log(
      '[startAIAssist]   aiAssistEndpoint:',
      aiAssistEndpoint,
    );
    console.log(
      '[startAIAssist]   aiAssistOptions:',
      aiAssistOptions,
    );
    console.log('[startAIAssist]   inputText:', inputText);
    console.log('[startAIAssist]   fileId:', fileId);
    console.log(
      '[startAIAssist]   insertionCursor:',
      insertionCursor,
    );
    console.log(
      '[startAIAssist]   aiStreamId:',
      aiStreamId,
    );
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
