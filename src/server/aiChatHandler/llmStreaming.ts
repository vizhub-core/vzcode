import {
  parseMarkdownFiles,
  StreamingMarkdownParser,
} from 'llm-code-format';
import { ChatOpenAI } from '@langchain/openai';
import OpenAI from 'openai';
import fs from 'fs';
import {
  updateAIStatus,
  createAIMessage,
  updateAIMessageContent,
  finalizeAIMessage,
  ensureFileExists,
  clearFileContent,
  appendLineToFile,
  updateFiles,
  updateAIScratchpad,
} from './chatOperations.js';
import { mergeFileChanges } from 'editcodewithai';

const DEBUG = false;

// Feature flag to enable/disable streaming editing.
// * If `true`, the AI streaming response will be used to
//   edit files in real-time by submitting ShareDB ops.
// * If `false`, the updates to code files will be applied
// only after the AI has finished generating the entire response.
//
// Current status: there's a tricky bug with the streaming
// where the AI edits sometimes don't apply correctly in CodeMirror.
// It seems that sometimes the op that clears the file content
// is not applied correctly in the front end, leading to
// a situation where the AI streaming edits are concatenated into the middle
// of the file instead of replacing it.
// See https://github.com/codemirror/codemirror.next/issues/1234
const enableStreamingEditing = false;

/**
 * Creates and configures the LLM function for streaming with reasoning tokens
 */
export const createLLMFunction = ({
  shareDBDoc,
  createVizBotLocalPresence,
  chatId,
}) => {
  return async (fullPrompt: string) => {
    const localPresence = createVizBotLocalPresence();
    
    // Create OpenRouter client for reasoning token support
    const openRouterClient = new OpenAI({
      apiKey: process.env.VIZHUB_EDIT_WITH_AI_API_KEY,
      baseURL: process.env.VIZHUB_EDIT_WITH_AI_BASE_URL || 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://vizhub.com',
        'X-Title': 'VizHub',
      },
    });

    let fullContent = '';
    let generationId = '';
    let currentEditingFileId = null;
    let currentEditingFileName = null;

    // Create initial AI message for streaming
    const aiMessageId = createAIMessage(shareDBDoc, chatId);

    // Function to report file edited
    // This is called when the AI has finished editing a file
    // and we want to update the message content with the file name.
    const reportFileEdited = () => {
      if (currentEditingFileName) {
        fullContent += ` * Edited ${currentEditingFileName}\n`;
        updateAIMessageContent(
          shareDBDoc,
          chatId,
          aiMessageId,
          fullContent,
        );
        currentEditingFileName = null;
      }
    };

    // Define callbacks for streaming parser
    const callbacks = {
      onFileNameChange: async (
        fileName: string,
        format: string,
      ) => {
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

        // Update AI status
        updateAIStatus(
          shareDBDoc,
          chatId,
          'Editing ' + fileName,
        );
      },
      onCodeLine: async (line: string) => {
        DEBUG && console.log(`Code line: ${line}`);

        // If streaming is enabled, we apply the line immediately
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
      onNonCodeLine: async (line: string) => {
        // We want to report a file edited only if the line is not empty,
        // because sometimes the LLMs leave a newline between the file name
        // declaration and th
        if (line.trim() !== '') {
          reportFileEdited();
        }
        fullContent += line + '\n';
        updateAIMessageContent(
          shareDBDoc,
          chatId,
          aiMessageId,
          fullContent,
        );
      },
    };

    const parser = new StreamingMarkdownParser(callbacks);

    const chunks = [];
    let reasoningContent = '';

    // Stream the response with reasoning tokens
    const modelName = process.env.VIZHUB_EDIT_WITH_AI_MODEL_NAME || 'anthropic/claude-3.5-sonnet';
    const stream = await (openRouterClient.chat.completions.create as any)({
      model: modelName,
      messages: [{ role: 'user', content: fullPrompt }],
      max_tokens: 8192,
      reasoning: { 
        effort: 'medium',
        exclude: false
      },
      usage: { include: true },
      stream: true,
    });

    let reasoningStarted = false;
    let contentStarted = false;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta as any; // Type assertion for OpenRouter-specific reasoning fields
      
      if (delta?.reasoning) {
        // Handle reasoning tokens (thinking)
        if (!reasoningStarted) {
          reasoningStarted = true;
          updateAIStatus(shareDBDoc, chatId, 'Thinking...');
        }
        reasoningContent += delta.reasoning;
        updateAIScratchpad(shareDBDoc, chatId, reasoningContent);
      } else if (delta?.content) {
        // Handle regular content tokens
        if (reasoningStarted && !contentStarted) {
          // Clear reasoning when content starts
          contentStarted = true;
          updateAIScratchpad(shareDBDoc, chatId, '');
          updateAIStatus(shareDBDoc, chatId, 'Generating response...');
        }
        
        const chunkContent = delta.content;
        chunks.push(chunkContent);

        if (enableStreamingEditing) {
          await parser.processChunk(chunkContent);
        } else {
          fullContent += chunkContent;
          updateAIMessageContent(
            shareDBDoc,
            chatId,
            aiMessageId,
            fullContent,
          );
        }
      } else if (chunk.usage) {
        // Handle usage information
        DEBUG && console.log('Usage:', chunk.usage);
      }

      if (!generationId && chunk.id) {
        generationId = chunk.id;
      }
    }
    await parser.flushRemaining();
    reportFileEdited();
    
    // Final cleanup - clear scratchpad and set final status
    updateAIScratchpad(shareDBDoc, chatId, '');
    updateAIStatus(shareDBDoc, chatId, 'Done editing.');
    updateAIMessageContent(
      shareDBDoc,
      chatId,
      aiMessageId,
      fullContent,
    );

    // Finalize the AI message by clearing temporary fields
    finalizeAIMessage(shareDBDoc, chatId);

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

    // If streaming editing is not enabled, we need to
    // apply all the edits at once
    if (!enableStreamingEditing) {
      updateFiles(
        shareDBDoc,
        mergeFileChanges(
          shareDBDoc.data.files,
          parseMarkdownFiles(fullContent, 'bold').files,
        ),
      );
    }

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
