import OpenAI from 'openai';
import { editOp } from 'ot-json1';

const openai = new OpenAI();

// Feature flag to slow down AI for development/testing
// See https://github.com/vizhub-core/vzcode/issues/290
const slowdown = true;

export const handleAIAssist =
  (shareDBDoc) => async (req, res) => {
    // Generate a response asynchronously,
    // mutating the ShareDB document as we go.
    try {
      const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', //was gpt-4
        messages: [
          {
            role: 'system',
            content:
              'Write typescript or javascript code that would follow the prompt',
          },
          { role: 'user', content: req.body.text },
        ],
        stream: true,
      });

      let insertionCursor = req.body.cursorLocation;

      for await (const part of stream) {
        // shareDBDoc.submitOp([req.body.fileId,["text",{"es":[insertionCursor,part.choices[0]?.delta?.content || '']}]],{source:"AIAssist"});
        const op = editOp(
          ['files', req.body.fileId, 'text'],
          'text-unicode',
          [
            insertionCursor,
            part.choices[0]?.delta?.content || '',
          ],
        );

        shareDBDoc.submitOp(op);
        insertionCursor += (
          part.choices[0]?.delta?.content || ''
        ).length;

        // Wait for 500ms
        if (slowdown) {
          await new Promise((resolve) => {
            setTimeout(resolve, 500);
          });
        }
      }

      res
        .status(200)
        .send({ message: 'Operation successful!' });
    } catch (error) {
      console.error('handleAIAssist error:');
      console.error(error);

      res.status(500).send({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  };
