import { timestampToDate } from '@vizhub/viz-utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, {
  useMemo,
  memo,
  useContext,
  forwardRef,
} from 'react';
import { DiffView, DiffViewRef } from './DiffView';
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
  showAdditionalWidgets?: boolean;
}

const MessageComponent = forwardRef<
  DiffViewRef,
  MessageProps
>(
  (
    {
      id,
      role,
      content,
      timestamp,
      isStreaming,
      diffData,
      chatId,
      showAdditionalWidgets = false,
    },
    ref,
  ) => {
    const { additionalWidgets, handleSendMessage } =
      useContext(VZCodeContext);

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

    // console.log(showAdditionalWidgets &&
    //         additionalWidgets &&
    //         chatId &&)
    console.log({
      showAdditionalWidgets,
      hasAdditionalWidgets: !!additionalWidgets,
      hasChatId: !!chatId,
    });

    return (
      <div className={messageClassName}>
        <div className="ai-chat-message-content">
          <Markdown remarkPlugins={[remarkGfm]}>
            {content}
          </Markdown>
          {enableDiffView &&
            diffData &&
            Object.keys(diffData).length > 0 && (
              <DiffView diffData={diffData} ref={ref} />
            )}
          {showAdditionalWidgets &&
            additionalWidgets &&
            chatId &&
            additionalWidgets({
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
  },
);

MessageComponent.displayName = 'MessageComponent';

export const Message = memo(MessageComponent);
