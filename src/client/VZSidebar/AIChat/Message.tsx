import { timestampToDate } from '@vizhub/viz-utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMemo, memo, useState, useContext } from 'react';
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
  beforeFiles?: any;
  chatId?: string;
  canUndo?: boolean;
}

const MessageComponent = ({
  id,
  role,
  content,
  timestamp,
  isStreaming,
  diffData,
  beforeFiles,
  chatId,
  canUndo,
}: MessageProps) => {
  const [isUndoing, setIsUndoing] = useState(false);
  const { aiChatUndoEndpoint, aiChatOptions = {} } =
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

  const handleUndo = async () => {
    if (
      !id ||
      !chatId ||
      !beforeFiles ||
      isUndoing ||
      !aiChatUndoEndpoint
    ) {
      return;
    }

    setIsUndoing(true);
    try {
      const response = await fetch(aiChatUndoEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vizId: aiChatOptions.vizId,
          chatId,
          messageId: id,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}`,
        );
      }

      // The server will handle the ShareDB operations to undo the changes
      // The UI will update automatically via ShareDB
    } catch (error) {
      console.error('Error undoing AI edit:', error);
      // TODO: Show user-friendly error message
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <div className={messageClassName}>
      <div className="ai-chat-message-content">
        <Markdown remarkPlugins={[remarkGfm]}>
          {content}
        </Markdown>
        {enableDiffView &&
          diffData &&
          Object.keys(diffData).length > 0 && (
            <DiffView
              diffData={diffData}
            />
          )}
        {canUndo && beforeFiles && (
          <div className="undo-button-container">
            <button
              className="undo-button"
              onClick={handleUndo}
              disabled={isUndoing}
              title="Undo this AI edit"
            >
              {isUndoing ? 'Undoing...' : 'Undo'}
            </button>
          </div>
        )}
      </div>
      <div className="ai-chat-message-time">
        {formattedTime}
      </div>
    </div>
  );
};

export const Message = memo(MessageComponent);
