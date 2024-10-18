import OpenAI from 'openai';
import axios from 'axios';
import { json1Presence } from '../ot.js';

const {
  VZCODE_AI_API_KEY,
  VZCODE_AI_BASE_URL,
  VZCODE_CLAUDE_API_KEY, // Claude API key
  VZCODE_CLAUDE_BASE_URL, // Claude Base URL if needed
} = process.env;

const isAIEnabled =
  VZCODE_AI_API_KEY !== undefined &&
  VZCODE_AI_BASE_URL !== undefined;
const isClaudeEnabled = VZCODE_CLAUDE_API_KEY !== undefined; // Check if Claude is enabled

const { editOp, type } = json1Presence;
const debug = false;
const slowdown = false;

const openAIOptions = {};

if (process.env.VZCODE_AI_API_KEY !== undefined) {
  openAIOptions.apiKey = process.env.VZCODE_AI_API_KEY;
}

if (process.env.VZCODE_AI_BASE_URL !== undefined) {
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
let openai;
if (isAIEnabled) {
  openai = new OpenAI(openAIOptions);
}

const AIShareDBSourceName = 'AIAssist';

const opComesFromAIAssist = (ops, source) =>
  source === AIShareDBSourceName;

const streams = {};

// Claude API request function
const generateClaudeResponse = async (inputText) => {
  if (!isClaudeEnabled) {
    console.log(
      '[generateClaudeResponse] Claude is not enabled.',
    );
    return;
  }

  try {
    const response = await axios.post(
      VZCODE_CLAUDE_BASE_URL ||
        'https://api.anthropic.com/v1/complete', // Adjust the URL if necessary
      {
        prompt: inputText,
        model: 'claude-2', // Specify the model you're using
        max_tokens_to_sample: 512, // Adjust token count as per your needs
        stop_sequences: ['\n'], // Define stop sequences if needed
        stream: false, // You can adjust this if Claude supports streaming
      },
      {
        headers: {
          'x-api-key': VZCODE_CLAUDE_API_KEY,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.completion;
  } catch (error) {
    console.error('[generateClaudeResponse] Error:', error);
    throw error;
  }
};

export const generateAIResponse = async ({
  inputText,
  insertionCursor,
  fileId,
  streamId,
  shareDBDoc,
  aiModel = 'openai', // Can be 'openai' or 'claude'
}) => {
  console.log(isAIEnabled, isClaudeEnabled);
  console.log(VZCODE_AI_API_KEY, VZCODE_CLAUDE_API_KEY);
  console.log(VZCODE_AI_BASE_URL, VZCODE_CLAUDE_BASE_URL);
  if (!isAIEnabled && !isClaudeEnabled) {
    console.log('[generateAIResponse] AI is not enabled.');
    return;
  }

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

  let aiResponse;
  if (aiModel === 'openai') {
    // OpenAI logic
    const messages = [
      {
        role: 'system',
        content: [
          'You are an expert programmer.',
          'Your task is to output ONLY the code that replaces <FILL_ME> correctly.',
        ].join(' '),
      },
      { role: 'user', content: inputText },
    ];

    streams[streamId] =
      await openai.chat.completions.create({
        model: 'gpt-4o',
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
      insertionCursor += (
        part.choices[0]?.delta?.content || ''
      ).length;
    }
  } else if (aiModel === 'claude') {
    // Claude logic
    aiResponse = await generateClaudeResponse(inputText);
    const op = editOp(
      ['files', fileId, 'text'],
      'text-unicode',
      [insertionCursor, aiResponse],
    );
    shareDBDoc.submitOp(op, {
      source: AIShareDBSourceName,
    });
    insertionCursor += aiResponse.length;
  }

  shareDBDoc.off('op', accomodateDocChanges);
};
