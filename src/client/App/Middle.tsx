import { useContext } from 'react';
import {
  Files,
  ShareDBDoc,
  Username,
  VZCodeContent,
} from '../../types';
import { ThemeLabel } from '../themes';
import { EditorCache } from '../useEditorCache';
import { TabState } from '../vzReducer';
import { SplitPaneResizeContext } from '../SplitPaneResizeContext';
import { TabList } from '../TabList';
import { CodeEditor } from '../CodeEditor';
import { CodeErrorOverlay } from '../CodeErrorOverlay';
import { PresenceNotifications } from '../PresenceNotifications';
import { AIAssistWidget } from '../AIAssistWidget';

export const Middle = ({
  files,
  tabList,
  activeFileId,
  setActiveFileId,
  openTab,
  closeTabs,
  createFile,
  content,
  shareDBDoc,
  submitOperation,
  localPresence,
  docPresence,
  theme,
  editorCache,
  editorWantsFocus,
  editorNoLongerWantsFocus,
  username,
  prettierError,
  typeScriptWorker,
}: {
  files: Files | null;
  tabList: Array<TabState>;
  activeFileId: string | null;
  setActiveFileId: (fileId: string) => void;
  openTab: ({
    fileId,
    isTransient,
  }: {
    fileId: string;
    isTransient?: boolean;
  }) => void;
  closeTabs: (fileIds: string[]) => void;
  createFile: (fileName: string) => void;
  content: VZCodeContent | null;
  shareDBDoc: ShareDBDoc<VZCodeContent> | null;
  submitOperation: (
    next: (content: VZCodeContent) => VZCodeContent,
  ) => void;
  localPresence: any;
  docPresence: any;
  theme: ThemeLabel;
  editorCache: EditorCache;
  editorWantsFocus: boolean;
  editorNoLongerWantsFocus: () => void;
  username: Username;
  prettierError: string | null;
  typeScriptWorker: Worker | null;
}) => {
  const { codeEditorWidth } = useContext(
    SplitPaneResizeContext,
  );
  return (
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
      <CodeErrorOverlay errorMessage={prettierError} />
      <PresenceNotifications
        docPresence={docPresence}
        localPresence={localPresence}
      />
      {content && activeFileId ? (
        <AIAssistWidget
          activeFileId={activeFileId}
          shareDBDoc={shareDBDoc}
          editorCache={editorCache}
          tabList={tabList}
        />
      ) : null}
    </div>
  );
};
