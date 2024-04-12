import { EditorView } from 'codemirror';
import {
  File,
  FileId,
  ShareDBDoc,
  VZCodeContent,
} from '../../types';
import { TabState } from '../vzReducer';
import { RequestId } from '../generateRequestId';
import { formatFile } from './formatFile';
import Anthropic from '@anthropic-ai/sdk';

const debug = false;

// Enables inclusion of code from open tabs as context.
const enableTabContext = false;

export const startAIAssist = async ({
  view,
  shareDBDoc,
  fileId,
  tabList,
}: {
  view: EditorView;
  shareDBDoc: ShareDBDoc<VZCodeContent>;
  fileId: FileId;
  tabList: Array<TabState>;
  aiStreamId: RequestId;
}) => {
  const currentFileName =
    shareDBDoc.data.files[fileId].name;
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
    console.log(
      '[startAIAssist]   inputText:\n`' + inputText + '`',
    );
  }

  const anthropic = new Anthropic({
    apiKey: 'THE_API_KEY', 
  });

  try {
    const response = await anthropic.completions.create({
      model: 'claude-3',
      max_tokens_to_sample: 1024,
      prompt: `${Anthropic.HUMAN_PROMPT} ${inputText}${Anthropic.AI_PROMPT}`,
    });

    console.log('Completion:', response.completion);
  } catch (error) {
    console.error('[startAIAssist] error:', error);
  }
};
