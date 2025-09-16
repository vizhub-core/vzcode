import React, { useMemo } from 'react';
import { timestampToDate } from '@vizhub/viz-utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { StreamingEvent } from '../../../types.js';
import { IndividualFileDiff } from './IndividualFileDiff';
import { FileEditingIndicator } from './FileEditingIndicator';
import { StatusIndicator } from './StatusIndicator';

const DEBUG = false;

interface StreamingMessageProps {
  id: string;
  timestamp: number;
  events: StreamingEvent[];
  currentStatus?: string;
  isComplete?: boolean;
  isActive?: boolean; // Is this the currently streaming message?
}

interface FileEditState {
  fileName: string;
  isComplete: boolean;
  beforeContent?: string;
  afterContent?: string;
  timestamp?: number;
}

export const StreamingMessage: React.FC<
  StreamingMessageProps
> = ({ timestamp, events, currentStatus, isActive }) => {
  DEBUG &&
    console.log(
      'StreamingMessage: Rendered with events:',
      events,
    );

  // Memoize date formatting to avoid repeated computation
  const formattedTime = useMemo(() => {
    return timestampToDate(timestamp).toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  }, [timestamp]);

  // Process events to extract text chunks and file states
  const { textChunks, fileStates } = useMemo(() => {
    const chunks: string[] = [];
    const files: Map<string, FileEditState> = new Map();

    events.forEach((event) => {
      switch (event.type) {
        case 'text_chunk':
          chunks.push(event.content);
          break;
        case 'file_start':
          files.set(event.fileName, {
            fileName: event.fileName,
            isComplete: false,
            timestamp: event.timestamp,
          });
          break;
        case 'file_complete':
          files.set(event.fileName, {
            fileName: event.fileName,
            isComplete: true,
            beforeContent: event.beforeContent,
            afterContent: event.afterContent,
            timestamp: event.timestamp,
          });
          break;
      }
    });

    return {
      textChunks: chunks,
      fileStates: Array.from(files.values()).sort(
        (a, b) => (a.timestamp || 0) - (b.timestamp || 0),
      ),
    };
  }, [events]);

  return (
    <div className="ai-chat-message assistant streaming">
      <div className="ai-chat-message-content">
        {/* Render text chunks */}
        {textChunks.map((chunk, index) => (
          <div key={`text-${index}`} className="text-chunk">
            <Markdown remarkPlugins={[remarkGfm]}>
              {chunk}
            </Markdown>
          </div>
        ))}

        {/* Render file editing states */}
        {fileStates.map((fileState) =>
          fileState.isComplete ? (
            <IndividualFileDiff
              key={fileState.fileName}
              fileName={fileState.fileName}
              beforeContent={fileState.beforeContent || ''}
              afterContent={fileState.afterContent || ''}
            />
          ) : (
            <FileEditingIndicator
              key={fileState.fileName}
              fileName={fileState.fileName}
            />
          ),
        )}

        {/* Show status indicator if active and has status */}
        {isActive && currentStatus && (
          <StatusIndicator status={currentStatus} />
        )}
      </div>
      <div className="ai-chat-message-time">
        {formattedTime}
      </div>
    </div>
  );
};
