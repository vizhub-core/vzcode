import { useContext, useEffect, useRef } from 'react';
import { VZCodeContext } from './VZCodeContext';
import { Presence, PresenceId, TabState } from '../types';
import { VizFileId } from '@vizhub/viz-types';

const DEBUG = true;

/**
 * Custom hook that handles auto-following users by opening tabs when presence
 * is received on files that are not currently open. This logic is independent
 * of CodeMirror extensions and works regardless of editor cache state.
 */
export const usePresenceAutoFollow = ({
  docPresence,
  enableAutoFollow,
  openTab,
  activePane,
}) => {
  // Track enableAutoFollow on a ref for use in event handlers
  const enableAutoFollowRef = useRef(enableAutoFollow);
  useEffect(() => {
    enableAutoFollowRef.current = enableAutoFollow;
  }, [enableAutoFollow]);

  // Track active file for comparison
  const activeFileIdRef = useRef(activePane?.activeFileId);
  useEffect(() => {
    activeFileIdRef.current = activePane?.activeFileId;
  }, [activePane?.activeFileId]);

  useEffect(() => {
    if (!docPresence) return;

    const handlePresenceReceive = (
      id: PresenceId,
      presence: Presence,
    ) => {
      if (DEBUG) {
        console.log(
          `[usePresenceAutoFollow] Received presence for id ${id}`,
          presence,
        );
      }

      // If presence is null, the user has disconnected
      if (!presence) {
        return;
      }

      // If auto-follow is not enabled, do nothing
      if (!enableAutoFollowRef.current) {
        return;
      }

      // Extract the file ID from the presence path
      // Presence path structure: [path, to, file, fileId, position]
      // We want the fileId which should be at index 1 for files
      const presenceFileId = presence.start[1] as VizFileId;

      // If the presence is for the currently active file, do nothing
      // (the CodeMirror extension will handle displaying the cursor)
      if (presenceFileId === activeFileIdRef.current) {
        return;
      }

      // If the presence is for a different file, open that tab
      DEBUG &&
        console.log(
          `[usePresenceAutoFollow] Auto-opening tab for ${presence.username} in file ${presenceFileId}`,
        );

      openTab({
        fileId: presenceFileId,
        isTransient: true,
      });
    };

    // Subscribe to presence changes
    docPresence.on('receive', handlePresenceReceive);

    // Cleanup subscription on unmount
    return () => {
      docPresence.off('receive', handlePresenceReceive);
    };
  }, [docPresence, openTab]);
};
