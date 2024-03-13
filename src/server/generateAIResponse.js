import OpenAI from 'openai';
import { json1Presence } from '../ot.js';

const { editOp, type } = json1Presence;

const debug = false;

// Feature flag to slow down AI for development/testing
const slowdown = true;

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

  const messages = [
    {
      role: 'system',
      content: [
        'You are an expert programmer.',
        'Your task is to output ONLY the code that replaces <FILL_ME> correctly.',
        'Do not add any markdown around.',
        'Do not duplicate the code before or after <FILL_ME>.',
        'Do not make any changes outside of <FILL_ME>.',
        'Do not enclose the output with backticks.',
        'If any additional instructions are required, they will be provided in comments.',
      ].join(' '),
    },
    { role: 'user', content: inputText },
  ];

  if (debug) {
    console.log('[generateAIResponse] messages:');
    console.log(JSON.stringify(messages, null, 2));
  }

  streams[streamId] = await openai.chat.completions.create({
    // model: 'gpt-3.5-turbo',
    model: 'gpt-4',

    messages,
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

    if (slowdown) {
      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    }

    insertionCursor += (
      part.choices[0]?.delta?.content || ''
    ).length;
  }
  shareDBDoc.off('op', accomodateDocChanges);
};
