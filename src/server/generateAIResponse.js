import OpenAI from 'openai';
import { json1Presence } from '../ot.js';

const { editOp, type } = json1Presence;

const debug = false;

// Feature flag to slow down AI for development/testing
const slowdown = false;

let openai;
if (process.env.OPENAI_API_KEY !== undefined) {
  openai = new OpenAI();
}

const AISourceName = 'AIAssist';

function opComesFromAIAssist(ops, source) {
  return source === AISourceName;
}

const streams = {};

export const generateAIResponse = async ({
  inputText,
  insertionCursor,
  fileId,
  streamId,
  shareDBDoc,
}) => {
  if (debug) {
    console.log(
      '[generateAIResponse] inputText:',
      inputText,
    );
    console.log(
      '[generateAIResponse] insertionCursor:',
      insertionCursor,
    );
    console.log('[generateAIResponse] fileId:', fileId);
    console.log('[generateAIResponse] streamId:', streamId);
    console.log(
      '[generateAIResponse] shareDBDoc:',
      shareDBDoc,
    );
  }
  function accomodateDocChanges(op, source) {
    if (!opComesFromAIAssist(op, source)) {
      if (op !== null) {
        insertionCursor = type
          .transformPosition(
            ['files', fileId, 'text', insertionCursor],
            op,
          )
          .slice(-1)[0];
      }
    }
  }

  shareDBDoc.on('op', accomodateDocChanges);

  streams[streamId] = await openai.chat.completions.create({
    // model: 'gpt-3.5-turbo',
    model: 'gpt-4',

    messages: [
      {
        role: 'system',
        content:
          'Write typescript or javascript code to continue the current file, given the other files for context. Use // for comments.',
      },
      { role: 'user', content: inputText },
    ],
    stream: true,
  });

  for await (const part of streams[streamId]) {
    const op = editOp(
      ['files', fileId, 'text'],
      'text-unicode',
      [
        insertionCursor,
        part.choices[0]?.delta?.content || '',
      ],
    );

    shareDBDoc.submitOp(op, { source: AISourceName });

    // Wait for 500ms
    if (slowdown) {
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    }

    insertionCursor += (
      part.choices[0]?.delta?.content || ''
    ).length;
  }
  shareDBDoc.off('op', accomodateDocChanges);
};
