import { VZSettings } from './VZSettings';
import { VZSidebar } from './VZSidebar';
import { CreateFileModal } from './VZSidebar/CreateFileModal';

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
      <CreateFileModal />
    </div>
  );
};
