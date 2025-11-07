/**
 * Validates incoming request data for AI chat messages
 */
export const validateRequest = (req, res) => {
  const { content, chatId } = req.body;

  if (!content || typeof content !== 'string') {
    res.status(400).json({
      error:
        'Invalid request: content is required and must be a string',
    });
    return false;
  }

  if (!chatId || typeof chatId !== 'string') {
    res.status(400).json({
      error:
        'Invalid request: chatId is required and must be a string',
    });
    return false;
  }

  return true;
};
