import { StreamingMarkdownParser } from 'llm-code-format';
import { ChatOpenAI } from '@langchain/openai';
import fs from 'fs';
import {
  updateAIStatus,
  updateAIScratchpad,
  ensureFileExists,
  clearFileContent,
  appendLineToFile,
} from './chatOperations.js';

const DEBUG = false;

/**
 * Creates and configures the LLM function for streaming
 */
export const createLLMFunction = ({
  shareDBDoc,
  createVizBotLocalPresence,
  chatId,
}) => {
  return async (fullPrompt) => {
    const localPresence = createVizBotLocalPresence();
    // Submit initial presence for VizBot
    const vizBotPresence = {
      username: 'VizBot',
      start: ['files'], // Indicate VizBot is working on files
      end: ['files'],
    };

    localPresence.submit(vizBotPresence, (error) => {
      if (error) {
        console.warn(
          'VizBot presence submission error:',
          error,
        );
      }
    });
    const chatModel = new ChatOpenAI({
      modelName:
        process.env.VIZHUB_EDIT_WITH_AI_MODEL_NAME ||
        'anthropic/claude-sonnet-4',
      configuration: {
        apiKey: process.env.VIZHUB_EDIT_WITH_AI_API_KEY,
        baseURL: process.env.VIZHUB_EDIT_WITH_AI_BASE_URL,
        defaultHeaders: {
          'HTTP-Referer': 'https://vizhub.com',
          'X-Title': 'VizHub',
        },
      },
      streaming: true,
    });

    let fullContent = '';
    let generationId = '';
    let currentEditingFileId = null;
    let currentEditingFileName = null;

    // Function to report file edited
    // This is called when the AI has finished editing a file
    // and we want to update the scratchpad with the file name.
    const reportFileEdited = () => {
      if (currentEditingFileName) {
        fullContent += ` * Edited ${currentEditingFileName}\n`;
        updateAIScratchpad(shareDBDoc, chatId, fullContent);
        currentEditingFileName = null;
      }
    };

    // Define callbacks for streaming parser
    const callbacks = {
      onFileNameChange: (fileName, format) => {
        DEBUG &&
          console.log(
            `File changed to: ${fileName} (${format})`,
          );

        // Find existing file or create new one
        currentEditingFileId = ensureFileExists(
          shareDBDoc,
          fileName,
        );

        reportFileEdited();
        currentEditingFileName = fileName;

        // Clear the file content to start fresh
        // (AI will regenerate the entire file content)
        clearFileContent(shareDBDoc, currentEditingFileId);

        // Update VizBot presence to show it's editing this specific file
        const filePresence = {
          username: 'VizBot',
          start: ['files', currentEditingFileId, 'text', 0],
          end: ['files', currentEditingFileId, 'text', 0],
        };

        localPresence.submit(filePresence, (error) => {
          if (error) {
            console.warn(
              'VizBot file presence submission error:',
              error,
            );
          }
        });

        // Update AI status
        updateAIStatus(
          shareDBDoc,
          chatId,
          'Editing ' + fileName,
        );
      },
      onCodeLine: (line) => {
        DEBUG && console.log(`Code line: ${line}`);

        if (currentEditingFileId) {
          // Apply OT operation for this line immediately
          appendLineToFile(
            shareDBDoc,
            currentEditingFileId,
            line,
          );

          // Update VizBot presence to show cursor at the end of the file
          const currentFile =
            shareDBDoc.data.files[currentEditingFileId];
          if (currentFile && currentFile.text) {
            const textLength = currentFile.text.length;
            const filePresence = {
              username: 'VizBot',
              start: [
                'files',
                currentEditingFileId,
                'text',
                textLength,
              ],
              end: [
                'files',
                currentEditingFileId,
                'text',
                textLength,
              ],
            };

            localPresence.submit(filePresence, (error) => {
              if (error) {
                console.warn(
                  'VizBot line presence submission error:',
                  error,
                );
              }
            });
          }
        }
      },
      onNonCodeLine: (line) => {
        // We want to report a file edited only if the line is not empty,
        // because sometimes the LLMs leave a newline between the file name
        // declaration and th
        if (line.trim() !== '') {
          reportFileEdited();
        }
        fullContent += line + '\n';
        updateAIScratchpad(shareDBDoc, chatId, fullContent);
      },
    };

    const parser = new StreamingMarkdownParser(callbacks);

    const chunks = [];

    // Stream the response
    const stream = await chatModel.stream(fullPrompt);
    for await (const chunk of stream) {
      if (chunk.content) {
        const chunkContent = String(chunk.content);
        chunks.push(chunkContent);
        parser.processChunk(chunkContent);
      }

      if (!generationId && chunk.lc_kwargs?.id) {
        generationId = chunk.lc_kwargs.id;
      }
    }
    parser.flushRemaining();
    reportFileEdited();
    updateAIStatus(shareDBDoc, chatId, 'Done editing.');
    updateAIScratchpad(shareDBDoc, chatId, fullContent);

    // Clear VizBot presence when done
    DEBUG &&
      console.log(
        'AI editing done, clearing VizBot presence',
      );
    localPresence.submit(null, (error) => {
      DEBUG && console.log('VizBot presence cleared');
      if (error) {
        console.warn(
          'VizBot presence cleanup error:',
          error,
        );
      }
    });

    // Write chunks file for debugging
    if (DEBUG) {
      const chunksFileJSONpath = `./ai-chunks-${chatId}.json`;
      fs.writeFileSync(
        chunksFileJSONpath,
        JSON.stringify(chunks, null, 2),
      );
      console.log(
        `AI chunks written to ${chunksFileJSONpath}`,
      );
    }

    return {
      content: fullContent,
      generationId: generationId,
    };
  };
};
