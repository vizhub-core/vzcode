import OpenAI from 'openai';
import axios from 'axios';
import { json1Presence } from '../ot.js';

const {
  VZCODE_AI_API_KEY,
  VZCODE_AI_BASE_URL,
  VZCODE_CLAUDE_API_KEY,
  VZCODE_CLAUDE_BASE_URL,
} = process.env;

const isAIEnabled = Boolean(VZCODE_AI_API_KEY && VZCODE_AI_BASE_URL);
const isClaudeEnabled = Boolean(VZCODE_CLAUDE_API_KEY);
const { editOp, type } = json1Presence;
const AIShareDBSourceName = 'AIAssist';

const openAIOptions = {
  apiKey: VZCODE_AI_API_KEY || 'Fake API Key',
  baseURL: VZCODE_AI_BASE_URL,
};

let openai;
if (isAIEnabled) {
  openai = new OpenAI(openAIOptions);
}

const debugLog = (...args) => debug && console.log(...args);

// Claude API request function
const generateClaudeResponse = async (inputText) => {
  if (!isClaudeEnabled) {
    console.log('[generateClaudeResponse] Claude is not enabled.');
    return;
  }
  try {
    const response = await axios.post(
      VZCODE_CLAUDE_BASE_URL || 'https://api.anthropic.com/v1/complete',
      {
        prompt: inputText,
        model: 'claude-2',
        max_tokens_to_sample: 512,
        stop_sequences: ['\n'],
        stream: false,
      },
      {
        headers: {
          'x-api-key': VZCODE_CLAUDE_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.completion;
  } catch (error) {
    console.error('[generateClaudeResponse] Error:', error);
    throw error;
  }
};

// Helper function to handle document changes
const accomodateDocChanges = (op, source, insertionCursor, fileId, shareDBDoc) => {
  if (source !== AIShareDBSourceName && op !== null) {
    return type
      .transformPosition(['files', fileId, 'text', insertionCursor], op)
      .slice(-1)[0];
  }
  return insertionCursor;
};

// Generate AI response
export const generateAIResponse = async ({
  inputText,
  insertionCursor,
  fileId,
  streamId,
  shareDBDoc,
  aiModel = 'openai',
}) => {
  if (!isAIEnabled && !isClaudeEnabled) {
    console.log('[generateAIResponse] AI is not enabled.');
    return;
  }

  debugLog(
    '[generateAIResponse] AI Status:',
    { isAIEnabled, isClaudeEnabled },
    'Environment Variables:',
    { VZCODE_AI_API_KEY, VZCODE_CLAUDE_API_KEY, VZCODE_AI_BASE_URL, VZCODE_CLAUDE_BASE_URL }
  );

  const updateCursor = (op, source) =>
    (insertionCursor = accomodateDocChanges(op, source, insertionCursor, fileId, shareDBDoc));

  shareDBDoc.on('op', updateCursor);

  if (aiModel === 'openai') {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert programmer. Your task is to output ONLY the code that replaces <FILL_ME> correctly.',
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
      const op = editOp(['files', fileId, 'text'], 'text-unicode', [insertionCursor, content]);
      shareDBDoc.submitOp(op, { source: AIShareDBSourceName });
      insertionCursor += content.length;
    }
  } else if (aiModel === 'claude') {
    const aiResponse = await generateClaudeResponse(inputText);
    const op = editOp(['files', fileId, 'text'], 'text-unicode', [insertionCursor, aiResponse]);
    shareDBDoc.submitOp(op, { source: AIShareDBSourceName });
    insertionCursor += aiResponse.length;
  }

  shareDBDoc.off('op', updateCursor);
};
