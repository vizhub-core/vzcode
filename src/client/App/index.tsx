import { useContext, useState } from 'react';
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
  useInitialUsername,
  usePersistUsername,
} from '../usernameLocalStorage';
import {
  useInitialEnableAIGhostCompletions,
  usePersistEnableAIGhostCompletions,
} from '../aiGhostCompletionsLocalStorage';
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

// Stores the AI ghost completions setting to local storage.
const PersistAIGhostCompletions = () => {
  const { enableAIGhostCompletions } = useContext(VZCodeContext);
  usePersistEnableAIGhostCompletions(enableAIGhostCompletions);
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
  // Get the initial username from localStorage.
  const initialUsername: Username = useInitialUsername();
  // Get the initial AI ghost completions setting from localStorage.
  const initialEnableAIGhostCompletions: boolean = useInitialEnableAIGhostCompletions();

  //@ts-ignore
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL; //Vite only parses VITE_ prefixed environment variables

  // Feature flag for enabling the right-side panel.
  // Useful for debugging dual split pane functionality.
  // We may want to add this as an actual VZCode feature,
  // for running the code that the VZCode user is developing
  // in the same browser window as the VZCode editor,
  // so that multiple browser windows are not required.
  const enableRightPanel = true;

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
        initialEnableAIGhostCompletions={initialEnableAIGhostCompletions}
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
        getStoredAIPrompt={() => null}
        clearStoredAIPrompt={() => {}}
        autoForkAndRetryAI={async () => {}}
      >
        <LiveKitRoom
          audio={true}
          token={liveKitToken}
          serverUrl={serverUrl}
          connect={liveKitConnection}
          style={{ height: '100%' }}
        >
          <div className="app">
            <VZLeft />
            <VZMiddle
              esLintSource={esLintSource}
            />
            {enableRightPanel ? <VZRight /> : null}
            <VZResizer side="left" />
            {enableRightPanel ? (
              <VZResizer side="right" />
            ) : null}
          </div>
          <PersistUsername />
          <PersistAIGhostCompletions />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </VZCodeProvider>
    </SplitPaneResizeProvider>
  );
}

export default App;
