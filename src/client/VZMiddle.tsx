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
import { Pane, LeafPane, SplitPane } from '../types';
import { isImageFile } from './utils/isImageFile';

// LeafPaneView component for rendering a single pane with tabs and editor
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
  customInteractRules: Array<InteractRule>;
  enableAIAssist: boolean;
  aiAssistEndpoint?: string;
  aiAssistOptions?: { [key: string]: string };
  aiAssistTooltipText?: string;
  aiAssistClickOverride?: () => void;
  aiCopilotEndpoint?: string;
  esLintSource: (
    view: EditorView,
  ) => Promise<readonly Diagnostic[]>;
}) => {
  // This prevents the CodeEditor from rendering during SSR.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div
      className="leaf-pane"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <TabList
        activeFileId={pane.activeFileId}
        tabList={pane.tabList}
      />
      <div style={{ flex: 1, position: 'relative' }}>
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
      </div>
    </div>
  );
};

// Simple resizer component for split panes
const SplitPaneResizer = ({
  orientation,
  onResize,
}: {
  orientation: 'vertical' | 'horizontal';
  onResize: (delta: number) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPosition(
      orientation === 'horizontal' ? e.clientX : e.clientY,
    );
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const currentPosition =
        orientation === 'horizontal'
          ? e.clientX
          : e.clientY;
      const delta = currentPosition - startPosition;
      onResize(delta);
      setStartPosition(currentPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener(
        'mousemove',
        handleMouseMove,
      );
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener(
          'mousemove',
          handleMouseMove,
        );
        document.removeEventListener(
          'mouseup',
          handleMouseUp,
        );
      };
    }
  }, [isDragging, startPosition, orientation, onResize]);

  return (
    <div
      className={`split-pane-resizer ${orientation}`}
      onMouseDown={handleMouseDown}
      style={{
        width:
          orientation === 'horizontal' ? '4px' : '100%',
        height: orientation === 'vertical' ? '4px' : '100%',
        backgroundColor: '#333',
        cursor:
          orientation === 'horizontal'
            ? 'col-resize'
            : 'row-resize',
        zIndex: 1,
      }}
    />
  );
};

// SplitPaneView component for rendering split panes with resizer
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
  pane: SplitPane;
  content: VizContent | null;
  customInteractRules: Array<InteractRule>;
  enableAIAssist: boolean;
  aiAssistEndpoint?: string;
  aiAssistOptions?: { [key: string]: string };
  aiAssistTooltipText?: string;
  aiAssistClickOverride?: () => void;
  aiCopilotEndpoint?: string;
  esLintSource: (
    view: EditorView,
  ) => Promise<readonly Diagnostic[]>;
}) => {
  const [splitRatio, setSplitRatio] = useState(0.5); // 50/50 split initially

  const handleResize = (delta: number) => {
    // Calculate new split ratio based on container size and delta
    // This is a simplified implementation
    const container = document.querySelector(
      '.split-pane-container',
    );
    if (container) {
      const containerSize =
        pane.orientation === 'horizontal'
          ? container.clientWidth
          : container.clientHeight;
      const deltaRatio = delta / containerSize;
      setSplitRatio((prev) =>
        Math.max(0.1, Math.min(0.9, prev + deltaRatio)),
      );
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection:
      pane.orientation === 'horizontal' ? 'row' : 'column',
    height: '100%',
    width: '100%',
  } as const;

  const firstPaneStyle = {
    [pane.orientation === 'horizontal'
      ? 'width'
      : 'height']: `${splitRatio * 100}%`,
    overflow: 'hidden',
  };

  const secondPaneStyle = {
    [pane.orientation === 'horizontal'
      ? 'width'
      : 'height']: `${(1 - splitRatio) * 100}%`,
    overflow: 'hidden',
  };

  return (
    <div
      className="split-pane-container"
      style={containerStyle}
    >
      <div style={firstPaneStyle}>
        <PaneView
          pane={pane.children[0]}
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
      <SplitPaneResizer
        orientation={pane.orientation}
        onResize={handleResize}
      />
      <div style={secondPaneStyle}>
        <PaneView
          pane={pane.children[1]}
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
    </div>
  );
};

// Main PaneView component that routes to LeafPaneView or SplitPaneView
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
}: {
  pane: Pane;
  content: VizContent | null;
  customInteractRules: Array<InteractRule>;
  enableAIAssist: boolean;
  aiAssistEndpoint?: string;
  aiAssistOptions?: { [key: string]: string };
  aiAssistTooltipText?: string;
  aiAssistClickOverride?: () => void;
  aiCopilotEndpoint?: string;
  esLintSource: (
    view: EditorView,
  ) => Promise<readonly Diagnostic[]>;
}) => {
  return pane.type === 'leafPane' ? (
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
  ) : (
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
    activePane,
    errorMessage,
  } = useContext(VZCodeContext);

  // True if the editor panes should be shown.
  const shouldShowEditorPanes: boolean =
    activePane.activeFileId !== null ||
    pane.type === 'splitPane';

  return shouldShowEditorPanes ? (
    <div
      className="middle"
      style={{ width: codeEditorWidth + 'px' }}
    >
      <PaneView
        pane={pane}
        content={content}
        customInteractRules={customInteractRules || []}
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
