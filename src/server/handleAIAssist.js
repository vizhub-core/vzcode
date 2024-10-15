import { generateAIResponse } from './generateAIResponse.js';

const debug = false;

export const handleAIAssist =
  (shareDBDoc) => async (req, res) => {
    const {
      inputText,
      insertionCursor,
      fileId,
      aiModel = 'openai',
    } = req.body; // Added aiModel parameter with default 'openai'

    if (debug) {
      console.log('[handleAIAssist] inputText:', inputText);
      console.log(
        '[handleAIAssist] insertionCursor:',
        insertionCursor,
      );
      console.log('[handleAIAssist] fileId:', fileId);
      console.log('[handleAIAssist] aiModel:', aiModel); // Log aiModel for debugging
    }

    try {
      await generateAIResponse({
        inputText,
        insertionCursor,
        fileId,
        shareDBDoc,
        aiModel, // Pass aiModel to the generateAIResponse function
      });

      res
        .status(200)
        .send({ message: 'Operation successful!' });
    } catch (error) {
      console.error('handleAIAssist error:', error);
      res.status(500).send({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  };

export function haltGeneration(streamId) {
  const stream = streams[streamId];

  if (stream) {
    stream.controller.abort();
  }
}
