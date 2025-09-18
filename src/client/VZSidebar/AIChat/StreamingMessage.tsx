import React, { useMemo, useContext } from 'react';
import { timestampToDate } from '@vizhub/viz-utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { StreamingEvent } from '../../../types.js';
import { IndividualFileDiff } from './IndividualFileDiff';
import { VZCodeContext } from '../../VZCodeContext';

const DEBUG = false;

interface StreamingMessageProps {
  id: string;
  timestamp: number;
  events: StreamingEvent[];
  isActive?: boolean; // Is this the currently streaming message?
  children?: React.ReactNode;
  chatId?: string;
  showAdditionalWidgets?: boolean;
}

export const StreamingMessage: React.FC<
  StreamingMessageProps
> = ({
  id,
  timestamp,
  events,
  isActive,
  children,
  chatId,
  showAdditionalWidgets = false,
}) => {
  const { additionalWidgets, handleSendMessage } =
    useContext(VZCodeContext);

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
            default:
              return null;
          }
        })}
        {showAdditionalWidgets &&
          additionalWidgets &&
          chatId &&
          additionalWidgets({
            messageId: id,
            chatId: chatId,
            handleSendMessage,
          })}
        {isActive && children}
      </div>
      <div className="ai-chat-message-time">
        {formattedTime}
      </div>
    </div>
  );
};
