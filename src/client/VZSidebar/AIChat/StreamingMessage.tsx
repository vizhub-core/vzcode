import React, { useMemo } from 'react';
import { timestampToDate } from '@vizhub/viz-utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { StreamingEvent } from '../../../types.js';
import { IndividualFileDiff } from './IndividualFileDiff';
import {
  AIEditingStatusIndicator,
  FileEditingIndicator,
} from './FileEditingIndicator';

const DEBUG = false;

interface StreamingMessageProps {
  id: string;
  timestamp: number;
  events: StreamingEvent[];
  currentStatus?: string;
  isComplete?: boolean;
  isActive?: boolean; // Is this the currently streaming message?
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

  // Track file states for rendering file editing indicators
  const fileStates = useMemo(() => {
    const files: Map<
      string,
      {
        isComplete: boolean;
        beforeContent?: string;
        afterContent?: string;
      }
    > = new Map();

    events.forEach((event) => {
      if (event.type === 'file_start') {
        files.set(event.fileName, { isComplete: false });
      } else if (event.type === 'file_complete') {
        files.set(event.fileName, {
          isComplete: true,
          beforeContent: event.beforeContent,
          afterContent: event.afterContent,
        });
      }
    });

    return files;
  }, [events]);

  return (
    <div className="ai-chat-message assistant streaming">
      <div className="ai-chat-message-content">
        {/* Render events in order */}
        {events.map((event, index) => {
          switch (event.type) {
            case 'text_chunk':
              return (
                <div
                  key={`text-${index}`}
                  className="text-chunk"
                >
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {event.content}
                  </Markdown>
                </div>
              );
            case 'file_complete':
              return (
                <IndividualFileDiff
                  key={`file-${event.fileName}-${index}`}
                  fileName={event.fileName}
                  beforeContent={event.beforeContent || ''}
                  afterContent={event.afterContent || ''}
                />
              );
            case 'file_start':
              // Only show file editing indicator if the file is not yet complete
              const fileState = fileStates.get(
                event.fileName,
              );
              if (!fileState?.isComplete) {
                return (
                  <FileEditingIndicator
                    key={`file-editing-${event.fileName}-${index}`}
                    fileName={event.fileName}
                  />
                );
              }
              return null;
            default:
              return null;
          }
        })}

        {/* Show status indicator if active and has status */}
        {isActive && currentStatus && (
          <AIEditingStatusIndicator
            status={currentStatus}
          />
        )}
      </div>
      <div className="ai-chat-message-time">
        {formattedTime}
      </div>
    </div>
  );
};
