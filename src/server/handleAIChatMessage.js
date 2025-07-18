import { dateToTimestamp } from '@vizhub/viz-utils';

const debug = false;

export const handleAIChatMessage =
  () => async (req, res) => {
    const { content } = req.body;

    if (debug) {
      console.log(
        '[handleAIChatMessage] content:',
        content,
      );
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        error:
          'Invalid request: content is required and must be a string',
      });
    }

    try {
      // Simulate AI response delay (replace with actual AI integration later)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000),
      );

      const aiResponse = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `I understand you're asking about: "${content}". This is a placeholder response. The AI chat feature is still being developed!`,
        timestamp: dateToTimestamp(new Date()),
      };

      res.status(200).json(aiResponse);
    } catch (error) {
      console.error('[handleAIChatMessage] error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  };
