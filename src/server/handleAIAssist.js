import OpenAI from 'openai';
import { editOp } from 'ot-json1';

const openai = new OpenAI();

export async function generateAIResponse({
  inputText,
  insertionCursor,
  fileId,
  shareDBDoc,
}) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'Write typescript or javascript code that would follow the prompt',
      },
      { role: 'user', content: inputText },
    ],
    stream: true,
  });

  let currentCursor = insertionCursor;

  for await (const part of stream) {
    const op = editOp(
      ['files', fileId, 'text'],
      'text-unicode',
      [
        currentCursor,
        part.choices[0]?.delta?.content || '',
      ],
    );

    shareDBDoc.submitOp(op);
    currentCursor += (part.choices[0]?.delta?.content || '')
      .length;
  }
}

export const handleAIAssist =
  (shareDBDoc) => async (req, res) => {
    try {
      await generateAIResponse({
        inputText: req.body.text,
        insertionCursor: req.body.cursorLocation,
        fileId: req.body.fileId,
        shareDBDoc: shareDBDoc,
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
