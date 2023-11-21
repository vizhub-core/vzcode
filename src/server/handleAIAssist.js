import OpenAI from 'openai';
import json1 from 'ot-json1';
import Replicate from 'replicate';

const { editOp, type, replaceOp } = json1;

// Feature flag to slow down AI for development/testing
const slowdown = false;

let openai;
if (process.env.OPENAI_API_KEY !== undefined) {
  openai = new OpenAI();
}

// Initialize the Replicate instance
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN, // Ensure you've set this environment variable
});

export async function generateAIResponse({
  inputText,
  insertionCursor,
  fileId,
  streamId,
  shareDBDoc,
  generator = 'OpenAI',
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

  // Conditional logic based on the chosen generator
  if (generator === 'OpenAI') {
    streams[streamId] =
      await openai.chat.completions.create({
        // model: 'gpt-3.5-turbo',
        model: 'gpt-4',

        messages: [
          {
            role: 'system',
            content:
              'Write typescript or javascript code to continue the current file, given the other files for context. Use // for comments.',
          },
          { role: 'user', content: inputText },
        ],
        stream: true,
      });

    for await (const part of streams[streamId]) {
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
  } else if (generator === 'Replicate') {
    const prediction = await replicate.predictions.create({
      stream: true,
      input: {
        prompt: `${inputText}`,
        system_prompt:
          'Write typescript or javascript code that would follow the prompt',
        max_new_tokens: 200,
        temperature: 0.7,
        repetition_penalty: 1,
        top_p: 1,
      },
      version: 'latest',
    });

    if (
      prediction &&
      prediction.urls &&
      prediction.urls.stream
    ) {
      const source = new EventSource(
        prediction.urls.stream,
        { withCredentials: true },
      );
      source.addEventListener('output', async (e) => {
        const data = JSON.parse(e.data);
        const content = data.content || '';
        const op = editOp(
          ['files', fileId, 'text'],
          'text-unicode',
          [insertionCursor, content],
        );

        shareDBDoc.submitOp(op, { source: AISourceName });
        insertionCursor += content.length;

        if (slowdown) {
          // Mimic the same slowdown effect for consistency
          await new Promise((resolve) => {
            setTimeout(resolve, 1000);
          });
        }
      });

      source.addEventListener('error', (e) => {
        console.error('error', JSON.parse(e.data));
      });

      source.addEventListener('done', (e) => {
        source.close();
        console.log('done', JSON.parse(e.data));
      });
    }
  }
  shareDBDoc.off('op', accomodateDocChanges);

  const confirmCompletedOperation = replaceOp(
    [
      'aiStreams',
      streamId,
      'AIStreamStatus',
      'serverIsRunning',
    ],
    true,
    false,
  );
  shareDBDoc.submitOp(confirmCompletedOperation, {
    source: 'AIServer',
  });
}

const AISourceName = 'AIAssist';

function opComesFromAIAssist(ops, source) {
  return source === AISourceName;
}

const streams = {};

//TODO: delete handleAIAssist. It is no longer used. generateAIResponse is triggered by changes to the sharedb document.
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

export function haltGeneration(streamId) {
  const stream = streams[streamId];

  // Stream can be undefined here if the user
  // clicks start and stop very quickly.
  if (stream) {
    stream.controller.abort();
  }
}
