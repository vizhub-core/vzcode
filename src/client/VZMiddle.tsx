import { useContext, useEffect, useState } from 'react';
import { SplitPaneResizeContext } from './SplitPaneResizeContext';
import { TabList } from './TabList';
import { CodeEditor } from './CodeEditor';
import { CodeErrorOverlay } from './CodeErrorOverlay';
import { PresenceNotifications } from './PresenceNotifications';
import { AIAssistWidget } from './AIAssist/AIAssistWidget';
import { VZCodeContext } from './VZCodeContext';
import { RunCodeWidget } from './RunCodeWidget';
import { InteractRule } from '@replit/codemirror-interact';

// The middle portion of the VZCode environment, containing:
// * The list of tabs at the top
// * The code editor itself
// * The code error overlay
// * The presence notifications
// * The UI for AI Assist
export const VZMiddle = ({
  enableAIAssist = true,
  aiAssistEndpoint,
  aiAssistOptions,
  aiAssistTooltipText,
  aiAssistClickOverride,
  customInteractRules,
}: {
  enableAIAssist?: boolean;
  aiAssistEndpoint?: string;
  aiAssistOptions?: { [key: string]: string };
  aiAssistTooltipText?: string;
  aiAssistClickOverride?: () => void;
  customInteractRules?: Array<InteractRule>;
}) => {
  const { codeEditorWidth } = useContext(
    SplitPaneResizeContext,
  );

  const {
    content,
    localPresence,
    docPresence,
    activeFileId,
    errorMessage,
  } = useContext(VZCodeContext);

  // This prevents the CodeEditor from rendering
  // during SSR.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return activeFileId !== null ? (
    <div
      className="middle"
      style={{ width: codeEditorWidth + 'px' }}
    >
      <TabList />
      {isClient && content && activeFileId && (
        <CodeEditor
          customInteractRules={customInteractRules}
        />
      )}
      {isClient &&
      enableAIAssist &&
      content &&
      activeFileId ? (
        <AIAssistWidget
          aiAssistEndpoint={aiAssistEndpoint}
          aiAssistOptions={aiAssistOptions}
          aiAssistTooltipText={aiAssistTooltipText}
          aiAssistClickOverride={aiAssistClickOverride}
        />
      ) : null}
      <RunCodeWidget />
      <CodeErrorOverlay
        errorMessage={errorMessage}
        content={content}
      />
      <PresenceNotifications
        docPresence={docPresence}
        localPresence={localPresence}
      />
    </div>
  ) : null;
};
