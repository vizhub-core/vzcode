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

  debug &&
    console.log('[generateAIResponse] Input:', {
      inputText,
      insertionCursor,
      fileId,
      streamId,
    });

  // Handle user edits in the document

  streams[streamId] =
    await together.chat.completions.create({
      model: 'your-together-model-name', // Replace with TogetherAI model
      messages,
      stream: true,
    });

  shareDBDoc.off('op', accommodateDocChanges);
};
