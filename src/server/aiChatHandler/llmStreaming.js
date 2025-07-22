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
export const createLLMFunction = (shareDBDoc, chatId) => {
  return async (fullPrompt) => {
    // Set up presence for VizBot following the same pattern as useShareDB.ts
    const docPresence =
      shareDBDoc.connection.getDocPresence(
        'documents',
        '1',
      );

    // Create local presence for VizBot with a unique ID
    const generateVizBotId = () => {
      const timestamp = Date.now().toString(36);
      return `vizbot-${timestamp}`;
    };

    const localPresence = docPresence.create(
      generateVizBotId(),
    );

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

        fullContent += ` * Editing ${fileName}\n`;
        updateAIScratchpad(shareDBDoc, chatId, fullContent);

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
        }
      },
      onNonCodeLine: (line) => {
        DEBUG && console.log(`Comment/text: ${line}`);
        fullContent += line + '\n';
        updateAIScratchpad(shareDBDoc, chatId, fullContent);
      },
    };

    const parser = new StreamingMarkdownParser(callbacks);

    // TODO write the chunks to a JSON file for later testing
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

    // Submit final update if there's pending content
    updateAIScratchpad(shareDBDoc, chatId, fullContent);

    // Clear VizBot presence when done
    localPresence.submit(null, (error) => {
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
