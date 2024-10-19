import OpenAI from 'openai';

// This module implements the generation of the copilot response,
// using the OpenAI client (but not necessarily the OpenAI service).

// Debug flag to log more information during development.
const debug = false;

// These environment variables are used to configure the OpenAI client.
// See `.env.sample` for the expected values.
const {
  VZCODE_AI_COPILOT_API_KEY,
  VZCODE_AI_COLIPOT_BASE_URL,
  VZCODE_AI_COLIPOT_MODEL,
} = process.env;

// If neither of these are not set, the OpenAI client will not be initialized,
// e.g. for local development where no AI is needed.
const isCopilotEnabled =
  VZCODE_AI_COPILOT_API_KEY !== undefined &&
  VZCODE_AI_COLIPOT_BASE_URL !== undefined &&
  VZCODE_AI_COLIPOT_MODEL !== undefined;

debug &&
  console.log('isCopilotEnabled: ' + isCopilotEnabled);

let openai;
if (isCopilotEnabled) {
  const openAIOptions = {
    apiKey: VZCODE_AI_COPILOT_API_KEY,
    baseURL: VZCODE_AI_COLIPOT_BASE_URL,
  };
  debug &&
    console.log(
      'openAIOptions: ' +
        JSON.stringify(openAIOptions, null, 2),
    );
  openai = new OpenAI(openAIOptions);
}

export const handleAICopilot =
  (/*TODO shareDBDoc*/) => async (req, res) => {
    // Don't break if the AI is not enabled.
    // This is useful for local development.
    if (!isCopilotEnabled) {
      res.status(200).send({ text: '' });
      return;
    }
    const { prefix, suffix } = req.body;

    const prompt = `<|fim_prefix|>${prefix}<|fim_suffix|>${suffix}<|fim_middle|>`;

    if (debug) {
      console.log(
        '[generateAIResponse] prompt:\n```\n' +
          prompt +
          '\n```\n',
      );
    }
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
      console.error('handleAICopilot error:', error);
      res.status(500).send({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  };
