import { timestampToDate } from '@vizhub/viz-utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, {
  useMemo,
  memo,
  useState,
  useContext,
} from 'react';
import { DiffView } from './DiffView';
import { UnifiedFilesDiff } from '../../../utils/fileDiff';
import { enableDiffView } from '../../featureFlags';
import { VZCodeContext } from '../../VZCodeContext';

interface MessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  diffData?: UnifiedFilesDiff;
  chatId?: string;
}

const MessageComponent = ({
  id,
  role,
  content,
  timestamp,
  isStreaming,
  diffData,
  chatId,
}: MessageProps) => {
  const {
    additionalWidgets,
    handleSendMessage,
  } = useContext(VZCodeContext);

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

  // Memoize the className string to avoid recreation
  const messageClassName = useMemo(() => {
    return `ai-chat-message ${role}${isStreaming ? ' streaming' : ''}`;
  }, [role, isStreaming]);



  return (
    <div className={messageClassName}>
      <div className="ai-chat-message-content">
        <Markdown remarkPlugins={[remarkGfm]}>
          {content}
        </Markdown>
        {enableDiffView &&
          diffData &&
          Object.keys(diffData).length > 0 && (
            <DiffView diffData={diffData} />
          )}
        {additionalWidgets &&
          chatId &&
          React.createElement(additionalWidgets, {
            messageId: id,
            chatId: chatId,
            handleSendMessage,
          })}
      </div>
      <div className="ai-chat-message-time">
        {formattedTime}
      </div>
    </div>
  );
};

export const Message = memo(MessageComponent);
