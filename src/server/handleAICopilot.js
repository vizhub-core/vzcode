import OpenAI from 'openai';

// Environment variables used to configure the OpenAI client
const {
  VZCODE_AI_COPILOT_API_KEY,
  VZCODE_AI_COLIPOT_BASE_URL,
  VZCODE_AI_COLIPOT_MODEL,
} = process.env;

// Determine if Copilot AI is enabled based on the environment variables
const isCopilotEnabled = Boolean(
  VZCODE_AI_COPILOT_API_KEY &&
    VZCODE_AI_COLIPOT_BASE_URL &&
    VZCODE_AI_COLIPOT_MODEL,
);

// Debugging utility function
const debugLog = (...args) => debug && console.log(...args);

// Initialize OpenAI client if Copilot AI is enabled
let openai;
if (isCopilotEnabled) {
  const openAIOptions = {
    apiKey: VZCODE_AI_COPILOT_API_KEY,
    baseURL: VZCODE_AI_COLIPOT_BASE_URL,
  };
  debugLog(
    'OpenAI options:',
    JSON.stringify(openAIOptions, null, 2),
  );
  openai = new OpenAI(openAIOptions);
}

// Handle AI Copilot request
export const handleAICopilot = () => async (req, res) => {
  // Return early if Copilot AI is not enabled, useful for local development
  if (!isCopilotEnabled) {
    return res.status(200).send({ text: '' });
  }

  const { prefix, suffix } = req.body;
  const prompt = `<|fim_prefix|>${prefix}<|fim_suffix|>${suffix}<|fim_middle|>`;

  debugLog('[handleAICopilot] Generated prompt:', prompt);

  try {
    const completion = await openai.completions.create({
      model: VZCODE_AI_COLIPOT_MODEL,
      prompt,
      max_tokens: 150,
      stop: ['<|fim_pad|>', '<|file_sep|>'],
    });
    const text = completion.choices[0].text;
    res.status(200).send({ text });
  } catch (error) {
    console.error('[handleAICopilot] Error:', error);
    res.status(500).send({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};
