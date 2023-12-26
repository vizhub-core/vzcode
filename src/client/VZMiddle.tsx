import { useContext } from 'react';
import { TabList } from './TabList';
import { CodeEditor } from './CodeEditor';
import { CodeErrorOverlay } from './CodeErrorOverlay';
import { PresenceNotifications } from './PresenceNotifications';
import { AIAssistWidget } from './AIAssistWidget';
import { VZCodeContext } from './VZCodeContext';

// The middle portion of the VZCode environment, containing:
// * The list of tabs at the top
// * The code editor itself
// * The code error overlay
// * The presence notifications
// * The UI for AI Assist
export const VZMiddle = ({ enableAIAssist = true }) => {
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

  return activeFileId !== null ? (
    <div className="middle">
      <TabList
        files={files}
        tabList={tabList}
        activeFileId={activeFileId}
        setActiveFileId={setActiveFileId}
        openTab={openTab}
        closeTabs={closeTabs}
        createFile={createFile}
      />
      {content && activeFileId ? (
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
          tabList={tabList}
        />
      ) : null}
      <CodeErrorOverlay errorMessage={errorMessage} />
      <PresenceNotifications
        docPresence={docPresence}
        localPresence={localPresence}
      />
      {enableAIAssist && content && activeFileId ? (
        <AIAssistWidget
          activeFileId={activeFileId}
          shareDBDoc={shareDBDoc}
          editorCache={editorCache}
          tabList={tabList}
        />
      ) : null}
    </div>
  ) : null;
};
