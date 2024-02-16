import { useContext, useEffect, useState } from 'react';
import { SplitPaneResizeContext } from './SplitPaneResizeContext';
import { TabList } from './TabList';
import { CodeEditor } from './CodeEditor';
import { CodeErrorOverlay } from './CodeErrorOverlay';
import { PresenceNotifications } from './PresenceNotifications';
import { AIAssistWidget } from './AIAssist/AIAssistWidget';
import { SaveAndRunWidget } from './SaveAndRun/SaveAndRunWidget';
import { VZCodeContext } from './VZCodeContext';

// The middle portion of the VZCode environment, containing:
// * The list of tabs at the top
// * The code editor itself
// * The code error overlay
// * The presence notifications
// * The UI for AI Assist
export const VZMiddle = ({
  saveAndRunTooltipText,
  enableAIAssist = true,
  aiAssistEndpoint,
  aiAssistOptions,
  aiAssistTooltipText,
  aiAssistClickOverride,
}: {
  saveAndRunTooltipText?: string;
  enableAIAssist?: boolean;
  aiAssistEndpoint?: string;
  aiAssistOptions?: { [key: string]: string };
  aiAssistTooltipText?: string;
  aiAssistClickOverride?: () => void;
}) => {
  const { codeEditorWidth } = useContext(
    SplitPaneResizeContext,
  );

  // TODO leverage this context in deeper levels of the component tree.
  const {
    content,
    shareDBDoc,
    submitOperation,
    localPresence,
    docPresence,
    files,
    createFile,
    activeFileId,
    setActiveFileId,
    tabList,
    openTab,
    closeTabs,
    theme,
    username,
    editorCache,
    editorWantsFocus,
    editorNoLongerWantsFocus,
    errorMessage,
    typeScriptWorker,
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
      <TabList
        files={files}
        tabList={tabList}
        activeFileId={activeFileId}
        setActiveFileId={setActiveFileId}
        openTab={openTab}
        closeTabs={closeTabs}
        createFile={createFile}
      />
      {isClient && content && activeFileId && (
        <CodeEditor
          shareDBDoc={shareDBDoc}
          submitOperation={submitOperation}
          localPresence={localPresence}
          docPresence={docPresence}
          activeFileId={activeFileId}
          theme={theme}
          editorCache={editorCache}
          editorWantsFocus={editorWantsFocus}
          editorNoLongerWantsFocus={
            editorNoLongerWantsFocus
          }
          username={username}
          typeScriptWorker={typeScriptWorker}
        />
      )}
      {isClient && content && activeFileId && (
        <SaveAndRunWidget 
          activeFileId={activeFileId}
          shareDBDoc={shareDBDoc}
          editorCache={editorCache}
          tabList={tabList}
          saveAndRunTooltipText={saveAndRunTooltipText}
        />
      )}
      {isClient &&
      enableAIAssist &&
      content &&
      activeFileId ? (
        <AIAssistWidget
          activeFileId={activeFileId}
          shareDBDoc={shareDBDoc}
          editorCache={editorCache}
          tabList={tabList}
          aiAssistEndpoint={aiAssistEndpoint}
          aiAssistOptions={aiAssistOptions}
          aiAssistTooltipText={aiAssistTooltipText}
          aiAssistClickOverride={aiAssistClickOverride}
        />
      ) : null}
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
