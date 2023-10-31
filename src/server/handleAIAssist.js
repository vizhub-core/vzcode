import OpenAI from 'openai';
import { editOp } from 'ot-json1';

//ot-text-unicode  and unicount are dependencies of ot-json1
import { type } from 'ot-text-unicode';
import { strPosToUni, uniToStrPos } from 'unicount';

const openai = new OpenAI();

export async function generateAIResponse({
  inputText,
  insertionCursor,
  fileId,
  shareDBDoc,
}) {
  function accomodateDocChanges(ops, source) {
    if (!opComesFromAIAssist(ops, source)) {
      console.log(source);
      console.log(ops);

      ops?.forEach((op) => {
        console.log(op);
        console.log(shareDBDoc.data.files[fileId].text);
        if (op !== null) {
          const unicodeCursor = type.transformPosition(
            strPosToUni(
              //The text of the file is needed.
              shareDBDoc.data.files[fileId].text,
              insertionCursor,
            ),
            op,
          );
          insertionCursor = uniToStrPos(unicodeCursor);
        }
      });
    }
  }

  shareDBDoc.on('op', accomodateDocChanges);

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

  for await (const part of stream) {
    const op = editOp(
      ['files', fileId, 'text'],
      'text-unicode',
      [
        insertionCursor,
        part.choices[0]?.delta?.content || '',
      ],
    );

    console.log(insertionCursor);
    shareDBDoc.submitOp(op, { source: AISourceName });
    insertionCursor += (
      part.choices[0]?.delta?.content || ''
    ).length;
  }
  shareDBDoc.off('op', accomodateDocChanges);
}

const AISourceName = 'AIAssist';

function opComesFromAIAssist(ops, source) {
  console.log(source);
  return source === AISourceName;
}

export const handleAIAssist =
  (shareDBDoc) => async (req, res) => {
    const {
      text: inputText,
      cursorLocation: insertionCursor,
      fileId,
    } = req.body;

    // await shareDBDoc.fetch();

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
