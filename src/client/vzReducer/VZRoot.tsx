import { useEffect, useCallback, useContext, Fragment } from "react";
import { VZCodeContext } from "./VZCodeContext";

import { VZLeft } from "./VZLeft";
import { VZMiddle } from "./VZMiddle";
import { VZRight } from "./VZRight";

import { VZSettings } from "./VZSettings";
import { VZKeyboardShortcutsDoc } from "./VZKeyboardShortcutsDoc";
import { CreateFileModal } from "./CreateFileModal";
import { CreateDirModal } from "./CreateDirModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { VoiceChatModal } from "./VoiceChatModal";

import { QuickOpenPalette } from "./QuickOpenPalette";
import { CommandPalette } from "./CommandPalette";

export const VZRoot = () => {
  const { state, dispatch } = useContext(VZCodeContext);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Quick Open
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        dispatch({ type: "quickOpen.show" } as any);
        return;
      }
      if (e.key === "Escape") {
        dispatch({ type: "quickOpen.hide" } as any);
        dispatch({ type: "command.hide" } as any);
        return;
      }

      // Command Palette (Ctrl/⌘ + Shift + P)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        dispatch({ type: "command.show" });
        return;
      }

      // Reopen closed tab
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        const last = state.closedTabs?.[0];
        if (last) {
          dispatch({ type: "openTab", filename: last } as any);
          dispatch({ type: "tabs.popClosed" } as any);
        }
        return;
      }

      // Zen Mode
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: "zen.toggle" } as any);
        return;
      }

      // Theme toggle (Ctrl/⌘ + Shift + L)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        dispatch({ type: "theme.toggle" } as any);
      }
    },
    [dispatch, state.closedTabs]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Fragment>
      {/* ——— App layout ——— */}
      <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100">
        {!state.zenMode && <VZLeft />}
        <VZMiddle className={state.zenMode ? "flex-1" : ""} />
        {!state.zenMode && <VZRight />}
      </div>

      {/* ——— Overlays / Modals ——— */}
      {state.isSettingsOpen && <VZSettings />}
      {state.isDocOpen && <VZKeyboardShortcutsDoc />}
      {state.modals?.showCreateFile && <CreateFileModal />}
      {state.modals?.showCreateDir && <CreateDirModal />}
      {state.modals?.showDeleteConfirm && <DeleteConfirmationModal />}
      {state.modals?.showVoiceChat && <VoiceChatModal />}

      {/* ——— Overlays ——— */}
      <QuickOpenPalette />
      <CommandPalette />
    </Fragment>
  );
};
