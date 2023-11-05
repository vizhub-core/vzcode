import OpenAI from 'openai';
import { editOp, type } from 'ot-json1';

// Feature flag to slow down AI for development/testing
const slowdown = false;

let openai;
if (process.env.OPENAI_API_KEY !== undefined) {
  openai = new OpenAI();
}

export async function generateAIResponse({
  inputText,
  insertionCursor,
  fileId,
  shareDBDoc,
}) {
  function accomodateDocChanges(op, source) {
    if (!opComesFromAIAssist(op, source)) {
      if (op !== null) {
        insertionCursor = type
          .transformPosition(
            ['files', fileId, 'text', insertionCursor],
            op,
          )
          .slice(-1)[0];
      }
    }
  }

  shareDBDoc.on('op', accomodateDocChanges);

  const stream = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'Write typescript or javascript code that would follow the prompt. Use // for comments.',
      },
      { role: 'user', content: inputText },
    ],
    stream: true,
  });

  for await (const part of stream) {
    const op = editOp(
      ['files', fileId, 'text'],
      'text-unicode',
      [
        insertionCursor,
        part.choices[0]?.delta?.content || '',
      ],
    );

    shareDBDoc.submitOp(op, { source: AISourceName });

    // Wait for 500ms
    if (slowdown) {
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    }

    insertionCursor += (
      part.choices[0]?.delta?.content || ''
    ).length;
  }
  shareDBDoc.off('op', accomodateDocChanges);
}

const AISourceName = 'AIAssist';

function opComesFromAIAssist(ops, source) {
  return source === AISourceName;
}

export const handleAIAssist =
  (shareDBDoc) => async (req, res) => {
    const {
      text: inputText,
      cursorLocation: insertionCursor,
      fileId,
    } = req.body;

    try {
      await generateAIResponse({
        inputText,
        insertionCursor,
        fileId,
        shareDBDoc,
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
