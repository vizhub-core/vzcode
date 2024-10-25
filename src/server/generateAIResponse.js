import OpenAI from 'openai';
import axios from 'axios';
import { json1Presence } from '../ot.js';

const {
  VZCODE_AI_API_KEY,
  VZCODE_AI_BASE_URL,
  VZCODE_CLAUDE_API_KEY,
  VZCODE_CLAUDE_BASE_URL,
} = process.env;

const isAIEnabled = VZCODE_AI_API_KEY && VZCODE_AI_BASE_URL;
const isClaudeEnabled = Boolean(VZCODE_CLAUDE_API_KEY);

const { editOp, type } = json1Presence;
const debug = false;

const openAIOptions = {
  apiKey: VZCODE_AI_API_KEY || 'Fake API Key',
  baseURL: VZCODE_AI_BASE_URL,
};

let openai;
if (isAIEnabled) {
  openai = new OpenAI(openAIOptions);
}

const AIShareDBSourceName = 'AIAssist';
const streams = {};

// Utility function to determine if the operation originates from AI Assist
const opComesFromAIAssist = (ops, source) =>
  source === AIShareDBSourceName;

// Claude API request handler
const generateClaudeResponse = async (inputText) => {
  if (!isClaudeEnabled) {
    console.warn(
      '[generateClaudeResponse] Claude is not enabled.',
    );
    return;
  }

  try {
    const response = await axios.post(
      VZCODE_CLAUDE_BASE_URL ||
        'https://api.anthropic.com/v1/complete',
      {
        prompt: inputText,
        model: 'claude-2',
        max_tokens_to_sample: 512,
        stop_sequences: ['\n'],
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

// AI response generation handler
export const generateAIResponse = async ({
  inputText,
  insertionCursor,
  fileId,
  streamId,
  shareDBDoc,
  aiModel = 'openai',
}) => {
  if (!isAIEnabled && !isClaudeEnabled) {
    console.warn('[generateAIResponse] AI is not enabled.');
    return;
  }

  if (debug) {
    console.log('[generateAIResponse] Details:', {
      inputText,
      insertionCursor,
      fileId,
      streamId,
      shareDBDoc,
    });
  }

  // Update cursor position in response to document changes
  const accomodateDocChanges = (op, source) => {
    if (!opComesFromAIAssist(op, source) && op) {
      insertionCursor = type
        .transformPosition(
          ['files', fileId, 'text', insertionCursor],
          op,
        )
        .slice(-1)[0];
    }
  };
  shareDBDoc.on('op', accomodateDocChanges);

  try {
    if (aiModel === 'openai') {
      await handleOpenAIResponse(
        inputText,
        fileId,
        streamId,
        insertionCursor,
        shareDBDoc,
      );
    } else if (aiModel === 'claude') {
      await handleClaudeResponse(
        inputText,
        fileId,
        insertionCursor,
        shareDBDoc,
      );
    }
  } finally {
    shareDBDoc.off('op', accomodateDocChanges);
  }
};

// Handle OpenAI response streaming
const handleOpenAIResponse = async (
  inputText,
  fileId,
  streamId,
  insertionCursor,
  shareDBDoc,
) => {
  const messages = [
    {
      role: 'system',
      content:
        'You are an expert programmer. Output ONLY the code that replaces <FILL_ME> correctly.',
    },
    { role: 'user', content: inputText },
  ];

  streams[streamId] = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    stream: true,
  });

  for await (const part of streams[streamId]) {
    const content = part.choices[0]?.delta?.content || '';
    const op = editOp(
      ['files', fileId, 'text'],
      'text-unicode',
      [insertionCursor, content],
    );
    shareDBDoc.submitOp(op, {
      source: AIShareDBSourceName,
    });
    insertionCursor += content.length;
  }
};

// Handle Claude response
const handleClaudeResponse = async (
  inputText,
  fileId,
  insertionCursor,
  shareDBDoc,
) => {
  const aiResponse =
    await generateClaudeResponse(inputText);
  if (!aiResponse) return;
  const op = editOp(
    ['files', fileId, 'text'],
    'text-unicode',
    [insertionCursor, aiResponse],
  );
  shareDBDoc.submitOp(op, { source: AIShareDBSourceName });
  insertionCursor += aiResponse.length;
};
