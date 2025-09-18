import React, { useMemo } from 'react';
import { timestampToDate } from '@vizhub/viz-utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { StreamingEvent } from '../../../types.js';
import { IndividualFileDiff } from './IndividualFileDiff';

const DEBUG = false;

interface StreamingMessageProps {
  timestamp: number;
  events: StreamingEvent[];
  isActive?: boolean; // Is this the currently streaming message?
  children?: React.ReactNode;
}

export const StreamingMessage: React.FC<
  StreamingMessageProps
> = ({ timestamp, events, isActive, children }) => {
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
              // File start events are now handled by centralized status logic in MessageList
              return null;
            case 'stopped':
              return (
                <div
                  key={`stopped-${index}`}
                  className="text-chunk stopped-message"
                >
                  <em>Generation stopped by user.</em>
                </div>
              );
            case 'error':
              return (
                <div
                  key={`error-${index}`}
                  className="text-chunk error-message"
                >
                  <em>Error: {event.message}</em>
                </div>
              );
            default:
              return null;
          }
        })}
        {isActive && children}
      </div>
      <div className="ai-chat-message-time">
        {formattedTime}
      </div>
    </div>
  );
};
