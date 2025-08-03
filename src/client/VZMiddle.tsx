import { useContext, useEffect, useState } from 'react';
import { SplitPaneResizeContext } from './SplitPaneResizeContext';
import { TabList } from './TabList';
import { CodeEditor } from './CodeEditor';
import { ImageViewer } from './ImageViewer';
import { CodeErrorOverlay } from './CodeErrorOverlay';
import { PresenceNotifications } from './PresenceNotifications';
import { AIAssistWidget } from './AIAssist/AIAssistWidget';
import { VZCodeContext } from './VZCodeContext';
import { RunCodeWidget } from './RunCodeWidget';
import { InteractRule } from '@replit/codemirror-interact';
import { EditorView } from '@codemirror/view';
import { Diagnostic } from '@codemirror/lint';
import { VizContent } from '@vizhub/viz-types';
import { LeafPane, Pane } from '../types';
import { isImageFile } from './utils/isImageFile';
import './SplitPane.scss';

// LeafPaneView component - renders a single pane with tabs and editor
const LeafPaneView = ({
  pane,
  content,
  customInteractRules,
  enableAIAssist,
  aiAssistEndpoint,
  aiAssistOptions,
  aiAssistTooltipText,
  aiAssistClickOverride,
  aiCopilotEndpoint,
  esLintSource,
}: {
  pane: LeafPane;
  content: VizContent | null;
  customInteractRules?: Array<InteractRule>;
  enableAIAssist?: boolean;
  aiAssistEndpoint?: string;
  aiAssistOptions?: { [key: string]: string };
  aiAssistTooltipText?: string;
  aiAssistClickOverride?: () => void;
  aiCopilotEndpoint?: string;
  esLintSource: (view: EditorView) => Promise<readonly Diagnostic[]>;
}) => {
  // This prevents the CodeEditor from rendering
  // during SSR.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <TabList
        activeFileId={pane.activeFileId}
        tabList={pane.tabList}
      />
      {isClient &&
        content &&
        pane.activeFileId &&
        (() => {
          // Get the active file to determine if it's an image
          const activeFile =
            content.files[pane.activeFileId];
          const shouldShowImageViewer =
            activeFile && isImageFile(activeFile.name);

          return shouldShowImageViewer ? (
            <ImageViewer />
          ) : (
            <CodeEditor
              customInteractRules={customInteractRules}
              aiCopilotEndpoint={aiCopilotEndpoint}
              esLintSource={esLintSource}
            />
          );
        })()}
      {isClient &&
      enableAIAssist &&
      content &&
      pane.activeFileId ? (
        <AIAssistWidget
          aiAssistEndpoint={aiAssistEndpoint}
          aiAssistOptions={aiAssistOptions}
          aiAssistTooltipText={aiAssistTooltipText}
          aiAssistClickOverride={aiAssistClickOverride}
          paneId={pane.id}
          activeFileId={pane.activeFileId}
          tabList={pane.tabList}
        />
      ) : null}
      <RunCodeWidget />
    </>
  );
};

// SplitPaneView component - renders split panes with a resizer
const SplitPaneView = ({
  pane,
  content,
  customInteractRules,
  enableAIAssist,
  aiAssistEndpoint,
  aiAssistOptions,
  aiAssistTooltipText,
  aiAssistClickOverride,
  aiCopilotEndpoint,
  esLintSource,
}: {
  pane: Pane;
  content: VizContent | null;
  customInteractRules?: Array<InteractRule>;
  enableAIAssist?: boolean;
  aiAssistEndpoint?: string;
  aiAssistOptions?: { [key: string]: string };
  aiAssistTooltipText?: string;
  aiAssistClickOverride?: () => void;
  aiCopilotEndpoint?: string;
  esLintSource: (view: EditorView) => Promise<readonly Diagnostic[]>;
}) => {
  if (pane.type !== 'splitPane') {
    throw new Error('Expected splitPane');
  }

  const isHorizontal = pane.orientation === 'horizontal';
  const isVertical = pane.orientation === 'vertical';

  return (
    <div 
      className={`split-pane-container ${isHorizontal ? 'horizontal' : 'vertical'}`}
    >
      {pane.children.map((childPane, index) => (
        <div key={childPane.id}>
          <div className="split-pane-child">
            <PaneView
              pane={childPane}
              content={content}
              customInteractRules={customInteractRules}
              enableAIAssist={enableAIAssist}
              aiAssistEndpoint={aiAssistEndpoint}
              aiAssistOptions={aiAssistOptions}
              aiAssistTooltipText={aiAssistTooltipText}
              aiAssistClickOverride={aiAssistClickOverride}
              aiCopilotEndpoint={aiCopilotEndpoint}
              esLintSource={esLintSource}
            />
          </div>
          {/* Add a simple resizer between panes (except for the last one) */}
          {index < pane.children.length - 1 && (
            <div 
              className={`split-pane-resizer ${isHorizontal ? 'horizontal' : 'vertical'}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Main PaneView component - decides whether to render a leaf or split pane
const PaneView = ({
  pane,
  content,
  customInteractRules,
  enableAIAssist,
  aiAssistEndpoint,
  aiAssistOptions,
  aiAssistTooltipText,
  aiAssistClickOverride,
  aiCopilotEndpoint,
  esLintSource,
}) => {
  if (pane.type === 'leafPane') {
    return (
      <LeafPaneView
        pane={pane}
        content={content}
        customInteractRules={customInteractRules}
        enableAIAssist={enableAIAssist}
        aiAssistEndpoint={aiAssistEndpoint}
        aiAssistOptions={aiAssistOptions}
        aiAssistTooltipText={aiAssistTooltipText}
        aiAssistClickOverride={aiAssistClickOverride}
        aiCopilotEndpoint={aiCopilotEndpoint}
        esLintSource={esLintSource}
      />
    );
  } else if (pane.type === 'splitPane') {
    return (
      <SplitPaneView
        pane={pane}
        content={content}
        customInteractRules={customInteractRules}
        enableAIAssist={enableAIAssist}
        aiAssistEndpoint={aiAssistEndpoint}
        aiAssistOptions={aiAssistOptions}
        aiAssistTooltipText={aiAssistTooltipText}
        aiAssistClickOverride={aiAssistClickOverride}
        aiCopilotEndpoint={aiCopilotEndpoint}
        esLintSource={esLintSource}
      />
    );
  } else {
    throw new Error(`Unknown pane type: ${pane.type}`);
  }
};

// The middle portion of the VZCode environment, containing:
// * The list of tabs at the top
// * The code editor itself
// * The code error overlay
// * The presence notifications
// * The UI for AI Assist
export const VZMiddle = ({
  enableAIAssist = false,
  aiAssistEndpoint,
  aiAssistOptions,
  aiAssistTooltipText,
  aiAssistClickOverride,
  aiCopilotEndpoint,
  aiChatEndpoint,
  aiChatOptions,
  customInteractRules,
  esLintSource,
}: {
  enableAIAssist?: boolean;
  aiAssistEndpoint?: string;
  aiAssistOptions?: { [key: string]: string };
  aiAssistTooltipText?: string;
  aiAssistClickOverride?: () => void;
  aiCopilotEndpoint?: string;
  aiChatEndpoint?: string;
  aiChatOptions?: { [key: string]: any };
  customInteractRules?: Array<InteractRule>;
  esLintSource: (
    view: EditorView,
  ) => Promise<readonly Diagnostic[]>;
}) => {
  const { codeEditorWidth } = useContext(
    SplitPaneResizeContext,
  );

  const {
    content,
    localPresence,
    docPresence,
    pane,
    errorMessage,
  } = useContext(VZCodeContext);

  // Check if we should show editor panes - true if there's at least one active file in any leaf pane
  const hasActiveFileInAnyPane = (currentPane: Pane): boolean => {
    if (currentPane.type === 'leafPane') {
      return currentPane.activeFileId !== null;
    } else if (currentPane.type === 'splitPane') {
      return currentPane.children.some(child => hasActiveFileInAnyPane(child));
    }
    return false;
  };

  const shouldShowEditorPanes: boolean = hasActiveFileInAnyPane(pane);

  return shouldShowEditorPanes ? (
    <div
      className="middle"
      style={{ width: codeEditorWidth + 'px' }}
    >
      <PaneView
        pane={pane}
        content={content}
        customInteractRules={customInteractRules}
        enableAIAssist={enableAIAssist}
        aiAssistEndpoint={aiAssistEndpoint}
        aiAssistOptions={aiAssistOptions}
        aiAssistTooltipText={aiAssistTooltipText}
        aiAssistClickOverride={aiAssistClickOverride}
        aiCopilotEndpoint={aiCopilotEndpoint}
        esLintSource={esLintSource}
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
