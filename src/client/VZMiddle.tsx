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

const LeafPaneView = ({
  pane,
  content,
  customInteractRules,
  allowGlobals,
  enableAIAssist,
  aiAssistEndpoint,
  aiAssistOptions,
  aiAssistTooltipText,
  aiAssistClickOverride,
  isClient,
}) => {
  // This should go in LeafPaneView
  return (
    <>
      <TabList
        activeFileId={pane.activeFileId}
        tabList={pane.tabList}
      />
      {isClient && content && pane.activeFileId && (
        <CodeEditor
          customInteractRules={customInteractRules}
          allowGlobals={allowGlobals}
        />
      )}
      {isClient &&
      enableAIAssist &&
      content &&
      pane.activeFileId ? (
        <AIAssistWidget
          aiAssistEndpoint={aiAssistEndpoint}
          aiAssistOptions={aiAssistOptions}
          aiAssistTooltipText={aiAssistTooltipText}
          aiAssistClickOverride={aiAssistClickOverride}
        />
      ) : null}
      <RunCodeWidget />
    </>
  );
};

const SplitPaneView = ({
  pane,
  content,
  customInteractRules,
  allowGlobals,
  enableAIAssist,
  aiAssistEndpoint,
  aiAssistOptions,
  aiAssistTooltipText,
  aiAssistClickOverride,
}) => {
  console.log('SplitPaneView');
  return (
    <>
      <PaneView
        pane={pane.children[0]}
        content={content}
        customInteractRules={customInteractRules}
        allowGlobals={allowGlobals}
        enableAIAssist={enableAIAssist}
        aiAssistEndpoint={aiAssistEndpoint}
        aiAssistOptions={aiAssistOptions}
        aiAssistTooltipText={aiAssistTooltipText}
        aiAssistClickOverride={aiAssistClickOverride}
      />
      <PaneView
        pane={pane.children[1]}
        content={content}
        customInteractRules={customInteractRules}
        allowGlobals={allowGlobals}
        enableAIAssist={enableAIAssist}
        aiAssistEndpoint={aiAssistEndpoint}
        aiAssistOptions={aiAssistOptions}
        aiAssistTooltipText={aiAssistTooltipText}
        aiAssistClickOverride={aiAssistClickOverride}
      />
    </>
  );
}


// TODO modify this to handle the SplitPane type
// Recursive structure?
// SplitPaneView
// LeafPaneView
const PaneView = ({
  pane,
  content,
  customInteractRules,
  allowGlobals,
  enableAIAssist,
  aiAssistEndpoint,
  aiAssistOptions,
  aiAssistTooltipText,
  aiAssistClickOverride,
}) => {
  // This prevents the CodeEditor from rendering
  // during SSR.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // TODO something like
  return pane.type === 'leafPane' ? (
    <LeafPaneView 
    pane = {pane}
    content = {content}
    customInteractRules = {customInteractRules}
    allowGlobals = {allowGlobals}
    enableAIAssist = {enableAIAssist}
    aiAssistEndpoint = {aiAssistEndpoint}
    aiAssistOptions = {aiAssistOptions}
    aiAssistTooltipText = {aiAssistTooltipText}
    aiAssistClickOverride = {aiAssistClickOverride}
    isClient = {isClient}
    />
  ) : (
    <SplitPaneView
    pane = {pane}
    content = {content}
    customInteractRules = {customInteractRules}
    allowGlobals = {allowGlobals}
    enableAIAssist = {enableAIAssist}
    aiAssistEndpoint = {aiAssistEndpoint}
    aiAssistOptions = {aiAssistOptions}
    aiAssistTooltipText = {aiAssistTooltipText}
    aiAssistClickOverride = {aiAssistClickOverride}
    />
  );
}


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
  allowGlobals = false,
}: {
  enableAIAssist?: boolean;
  aiAssistEndpoint?: string;
  aiAssistOptions?: { [key: string]: string };
  aiAssistTooltipText?: string;
  aiAssistClickOverride?: () => void;
  customInteractRules?: Array<InteractRule>;
  allowGlobals?: boolean;
}) => {
  const { codeEditorWidth } = useContext(
    SplitPaneResizeContext,
  );

  const {
    content,
    localPresence,
    docPresence,
    pane,
    activePane,
    errorMessage,
  } = useContext(VZCodeContext);

  if (activePane.type !== 'leafPane') {
    throw new Error('Expected leafPane');
  }
  // True if the editor panes should be shown.
  const shouldShowEditorPanes: boolean =
    activePane.activeFileId !== null;

  return shouldShowEditorPanes ? (
    <div
      className="middle"
      style={{ width: codeEditorWidth + 'px' }}
    >
      <PaneView
        pane={pane}
        content={content}
        customInteractRules={customInteractRules}
        allowGlobals={allowGlobals}
        enableAIAssist={enableAIAssist}
        aiAssistEndpoint={aiAssistEndpoint}
        aiAssistOptions={aiAssistOptions}
        aiAssistTooltipText={aiAssistTooltipText}
        aiAssistClickOverride={aiAssistClickOverride}
      />
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
