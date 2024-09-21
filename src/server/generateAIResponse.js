import OpenAI from 'openai';
import { json1Presence } from '../ot.js';

const { editOp, type } = json1Presence;

const debug = false;

// Feature flag to slow down AI for development/testing
const slowdown = false;

// The options passed into the OpenAI client
// new OpenAI(openAIOptions)
const openAIOptions = {};

// Support specifying the API key via an environment variable
// If VZCODE_AI_API_KEY is not set, note that the OpenAI client
// will look for the OPENAI_API_KEY environment variable instead.
if (process.env.VZCODE_AI_API_KEY !== undefined) {
  openAIOptions.apiKey = process.env.VZCODE_AI_API_KEY;
}

// Support for local AI server
if (process.env.VZCODE_AI_BASE_URL !== undefined) {
  // The OpenAI client errors if the API key is not set,
  // so in the case where we don't need an API key,
  // e.g. for testing with a local AI server like LM Studio or LocalAI,
  // we populate the option with a fake API key, so it doesn't error.
  if (!openAIOptions.apiKey) {
    openAIOptions.apiKey = 'Fake API Key';
  }

  openAIOptions.baseURL = process.env.VZCODE_AI_BASE_URL;
}

debug &&
  console.log(
    'openAIOptions: ' +
      JSON.stringify(openAIOptions, null, 2),
  );
const openai = new OpenAI(openAIOptions);

// The name of the source that the AI responses
// will be attributed to in ShareDB operations.
const AIShareDBSourceName = 'AIAssist';

// Returns trie if the operation comes from AI.
const opComesFromAIAssist = (ops, source) =>
  source === AIShareDBSourceName;

// Keeps track of the currently ongoing AI streams.
// There could be many streams at the same time.
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

  // Handle the case that a user edits the text in the document
  // that comes becofore the insertion cursor.
  const accomodateDocChanges = (op, source) => {
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
  };
  shareDBDoc.on('op', accomodateDocChanges);

  // The prompt!
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

    shareDBDoc.submitOp(op, {
      source: AIShareDBSourceName,
    });

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
