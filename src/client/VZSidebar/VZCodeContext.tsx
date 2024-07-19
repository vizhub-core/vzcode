import { createContext, useState, useEffect, useRef } from 'react';

export let VZCodeContext: React.Context<unknown>;
// @ts-ignore
VZCodeContext = createContext();

export const VZCodeProvider = ({ children }) => {
  const [files, setFiles] = useState(null);
  const [openTab, setOpenTab] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [connected, setConnected] = useState(true);
  const [enableAutoFollow, setEnableAutoFollow] = useState(false);
  const [savingStatus, setSavingStatus] = useState('saved'); // New state for saving status
  const sidebarRef = useRef(null);

  // Mock function to simulate saving process
  const saveChanges = () => {
    setSavingStatus('Saving...');
    setTimeout(() => {
      setSavingStatus('Saved');
    }, 2000);
  };

  // Mock effect to simulate connection status check
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate connection check
      setConnected(navigator.onLine);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <VZCodeContext.Provider
      value={{
        files,
        openTab,
        setOpenTab,
        isSettingsOpen,
        setIsSettingsOpen,
        isDocOpen,
        setIsDocOpen,
        isSearchOpen,
        setIsSearchOpen,
        connected,
        sidebarRef,
        enableAutoFollow,
        setEnableAutoFollow,
        toggleAutoFollow: () => setEnableAutoFollow(prev => !prev),
        savingStatus, // Expose saving status in the context
        saveChanges,  // Expose the save function in the context
      }}
    >
      {children}
    </VZCodeContext.Provider>
  );
};
