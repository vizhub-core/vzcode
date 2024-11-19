import Together from 'together-ai';
import { json1Presence } from '../ot.js';

// Environment variables for TogetherAI
const { TOGETHER_AI_API_KEY, TOGETHER_AI_BASE_URL } =
  process.env;

// Check if TogetherAI is enabled
const isAIEnabled =
  TOGETHER_AI_API_KEY !== undefined &&
  TOGETHER_AI_BASE_URL !== undefined;

const { editOp, type } = json1Presence;

// Debug flag
const debug = false;

// Slowdown flag for testing
const slowdown = false;

// TogetherAI options
const togetherAIOptions = {};

if (TOGETHER_AI_API_KEY) {
  togetherAIOptions.defaultHeaders = {
    Authorization: `Bearer ${TOGETHER_AI_API_KEY}`,
  };
}

if (TOGETHER_AI_BASE_URL) {
  togetherAIOptions.baseURL = TOGETHER_AI_BASE_URL;
}

debug &&
  console.log(
    'togetherAIOptions: ' +
      JSON.stringify(togetherAIOptions, null, 2),
  );

let together;

if (isAIEnabled) {
  together = new Together(togetherAIOptions);
}

// ShareDB AI source name
const AIShareDBSourceName = 'AIAssist';

// Function to check if operation comes from AI
const opComesFromAIAssist = (ops, source) =>
  source === AIShareDBSourceName;

// Keep track of ongoing AI streams
const streams = {};
export const generateSummary = async (text) => {
  if (!isAIEnabled) return '[Summary feature disabled]';

  const messages = [
    {
      role: 'system',
      content:
        'Summarize the following text in a few sentences.',
    },
    { role: 'user', content: text },
  ];

  try {
    const summaryResponse =
      await together.chat.completions.create({
        model: 'summary-model', // Replace with TogetherAI model for summaries
        messages,
      });
    return (
      summaryResponse?.choices[0]?.message?.content ||
      'No summary available'
    );
  } catch (error) {
    console.error('Error generating summary:', error);
    return '[Error in summary generation]';
  }
};

// Generate AI response using TogetherAI
export const generateAIResponse = async ({
  inputText,
  insertionCursor,
  fileId,
  streamId,
  shareDBDoc,
}) => {
  if (!isAIEnabled) {
    console.log(
      '[generateAIResponse] TogetherAI is not enabled. Skipping AI generation.',
    );
    return;
  }
  // Retry attempts for TogetherAI responses
  const maxRetries = 3;

  const fetchAIResponse = async (params, retries = 0) => {
    try {
      return await together.chat.completions.create(params);
    } catch (error) {
      if (retries < maxRetries) {
        console.warn(
          `Retrying AI request (${retries + 1}/${maxRetries})...`,
        );
        return fetchAIResponse(params, retries + 1);
      } else {
        console.error(
          'AI request failed after retries:',
          error,
        );
        return null;
      }
    }
  };

  debug &&
    console.log('[generateAIResponse] Input:', {
      inputText,
      insertionCursor,
      fileId,
      streamId,
    });

  // Handle user edits in the document
  const accommodateDocChanges = (op, source) => {
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
  shareDBDoc.on('op', accommodateDocChanges);

  // Construct the AI prompt
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

  debug &&
    console.log('[generateAIResponse] Messages:', messages);

  streams[streamId] =
    await together.chat.completions.create({
      model: 'your-together-model-name', // Replace with TogetherAI model
      messages,
      stream: true,
    });

  // Process the stream
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
      await new Promise((resolve) =>
        setTimeout(resolve, 2000),
      );
    }

    insertionCursor += (
      part.choices[0]?.delta?.content || ''
    ).length;
  }

  shareDBDoc.off('op', accommodateDocChanges);
};
