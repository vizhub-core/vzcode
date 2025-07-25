import {
  generateAIResponse,
  streams,
} from './generateAIResponse.js';

const debug = false;

export const handleAIAssist =
  (shareDBDoc: any) => async (req: any, res: any) => {
    const { inputText, insertionCursor, fileId } = req.body;

    if (debug) {
      console.log('[handleAIAssist] inputText:', inputText);
      console.log(
        '[handleAIAssist] insertionCursor:',
        insertionCursor,
      );
      console.log('[handleAIAssist] fileId:', fileId);
    }

    try {
      // Generate a unique streamId for this request
      const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await generateAIResponse({
        inputText,
        insertionCursor,
        fileId,
        streamId,
        shareDBDoc,
      });

      res
        .status(200)
        .send({ message: 'Operation successful!' });
    } catch (error: any) {
      console.error('handleAIAssist error:', error);
      res.status(500).send({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  };

export function haltGeneration(streamId: string) {
  const stream = streams[streamId];

  // Stream can be undefined here if the user
  // clicks start and stop very quickly.
  if (stream) {
    stream.controller.abort();
  }
}
