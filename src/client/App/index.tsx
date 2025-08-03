import { useContext, useState, useEffect } from 'react';
import ShareDBClient from 'sharedb-client-browser/dist/sharedb-client-umd.cjs';
import { json1Presence } from '../../ot';
import { Username } from '../../types';
// @ts-ignore
import PrettierWorker from '../usePrettier/worker?worker';
// @ts-ignore
import {
  LiveKitRoom,
  RoomAudioRenderer,
} from '@livekit/components-react';
import { v4 } from 'uuid';
import { SplitPaneResizeProvider } from '../SplitPaneResizeContext';
import {
  VZCodeContext,
  VZCodeProvider,
} from '../VZCodeContext';
import { VZLeft } from '../VZLeft';
import { VZMiddle } from '../VZMiddle';
import { VZResizer } from '../VZResizer';
import { VZRight } from '../VZRight';
import {
  MobileNavigation,
  MobileView,
} from '../MobileNavigation';
import {
  useInitialUsername,
  usePersistUsername,
} from '../usernameLocalStorage';
import './style.scss';
import { useShareDB } from './useShareDB';
import { useESLint } from '../useESLint';

// Instantiate the Prettier worker.
const prettierWorker = new PrettierWorker();

// Register our custom JSON1 OT type that supports presence.
// See https://github.com/vizhub-core/json1-presence
ShareDBClient.types.register(json1Presence.type);

// Establish the singleton ShareDB connection over WebSockets.
// TODO consider using reconnecting WebSocket
const { Connection } = ShareDBClient;
const wsProtocol =
  window.location.protocol === 'https:'
    ? 'wss://'
    : 'ws://';
const socket = new WebSocket(
  wsProtocol + window.location.host + '/ws',
);
const connection = new Connection(socket);

// Stores the username to local storage.
// TODO consider if there's a cleaner pattern for this.
// This makes sense in VZCode itself, but for an app with
// authentication that wraps VZCode, it is not required.
const PersistUsername = () => {
  const { username } = useContext(VZCodeContext);
  usePersistUsername(username);
  return null;
};

function App() {
  const {
    shareDBDoc,
    content,
    localPresence,
    docPresence,
    submitOperation,
    connected,
    pending,
  } = useShareDB({
    connection,
  });

  //state for the voice channel
  const [liveKitToken, setLiveKitToken] =
    useState(undefined);
  const [liveKitRoomName, setLiveKitRoomName] =
    useState(v4()); //default room name will be an arbitrary uuid
  const [liveKitConnection, setLiveKitConnection] =
    useState(false);
  const { esLintSource } = useESLint();

  // Mobile navigation state
  const [currentMobileView, setCurrentMobileView] =
    useState<MobileView>('files');
  const [isMobile, setIsMobile] = useState(false);

  // Get the initial username from localStorage.
  const initialUsername: Username = useInitialUsername();

  //@ts-ignore
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL; //Vite only parses VITE_ prefixed environment variables

  // Feature flag for enabling the right-side panel.
  // Useful for debugging dual split pane functionality.
  // We may want to add this as an actual VZCode feature,
  // for running the code that the VZCode user is developing
  // in the same browser window as the VZCode editor,
  // so that multiple browser windows are not required.
  const enableRightPanel = true;

  // TODO: enable this when the AI copilot is ready
  // Currently it's glitchy and frustrating to use.
  // It appears to be bugs in the upstream CodeMirror copilot code.
  // Ghost text appears after just moving the cursor, not typing.
  // It's hard to figure out how to dismiss it.
  // Clicking on it accepts it but should not.
  const enableCopilot = false;

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Only auto-switch to preview when first loading with files and starting at files view
      if (
        mobile &&
        content?.files &&
        Object.keys(content.files).length > 0 &&
        currentMobileView === 'files'
      ) {
        // Don't auto-switch, let user control the view
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Check if there's an open file for mobile navigation
  const hasOpenFile =
    content?.files && Object.keys(content.files).length > 0;

  // Generate CSS class for mobile view state
  const appClassName = isMobile
    ? `app mobile-view-${currentMobileView}`
    : 'app';

  return (
    <SplitPaneResizeProvider>
      <VZCodeProvider
        content={content}
        shareDBDoc={shareDBDoc}
        submitOperation={submitOperation}
        localPresence={localPresence}
        docPresence={docPresence}
        prettierWorker={prettierWorker}
        initialUsername={initialUsername}
        connected={connected}
        pending={pending}
        liveKitRoomName={liveKitRoomName}
        setLiveKitRoom={setLiveKitRoomName}
        liveKitToken={liveKitToken}
        setLiveKitToken={setLiveKitToken}
        liveKitConnection={liveKitConnection}
        setLiveKitConnection={setLiveKitConnection}
        aiChatEndpoint="/ai-chat-message"
        aiChatUndoEndpoint="/ai-chat-undo"
        aiChatOptions={{}}
      >
        <LiveKitRoom
          audio={true}
          token={liveKitToken}
          serverUrl={serverUrl}
          connect={liveKitConnection}
          style={{ height: '100%' }}
        >
          <div className={appClassName}>
            <VZLeft />
            <VZMiddle
              aiCopilotEndpoint={
                enableCopilot ? '/ai-copilot' : null
              }
              esLintSource={esLintSource}
            />
            {enableRightPanel ? <VZRight /> : null}
            <VZResizer side="left" />
            {enableRightPanel ? (
              <VZResizer side="right" />
            ) : null}
          </div>
          <MobileNavigation
            currentView={currentMobileView}
            onViewChange={setCurrentMobileView}
            hasOpenFile={hasOpenFile}
          />
          <PersistUsername />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </VZCodeProvider>
    </SplitPaneResizeProvider>
  );
}

export default App;
