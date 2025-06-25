import { enableLiveKit } from './featureFlags';
import { VZKeyboardShortcutsDoc } from './VZKeyboardShortcutsDoc';
import { VZSettings } from './VZSettings';
import { VZSidebar } from './VZSidebar';
import { CreateDirModal } from './VZSidebar/CreateDirModal';
import { CreateFileModal } from './VZSidebar/CreateFileModal';
import { VoiceChatModal } from './VZSidebar/VoiceChatModal';

// The middle portion of the VZCode environment, containing:
// * The sidebar
// * The settings modal
// * The create file modal
export const VZLeft = ({ enableUsernameField = true }) => {
  return (
    <div className="left">
      <VZSidebar />
      <VZSettings
        enableUsernameField={enableUsernameField}
      />
      <VZKeyboardShortcutsDoc />
      <CreateFileModal />
      <CreateDirModal />
      {enableLiveKit && <VoiceChatModal />}
    </div>
  );
};
