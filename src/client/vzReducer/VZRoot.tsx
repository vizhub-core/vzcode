import { useEffect, useContext } from "react";
import { VZCodeContext, VZCodeContextType } from "./VZCodeContext";

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

export const VZRoot = () => {
  const { state, dispatch } = useContext<VZCodeContextType>(VZCodeContext);

  // Keyboard: ⌘/Ctrl+P opens Quick Open; Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        dispatch({ type: "quickOpen.show" });
      }
      if (e.key === "Escape") dispatch({ type: "quickOpen.hide" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  return (
    <>
      {/* ——— App layout ——— */}
      <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100">
        <VZLeft />
        <VZMiddle />
        <VZRight />
      </div>

      {/* ——— Overlays / Modals ——— */}
      {state.isSettingsOpen && <VZSettings />}
      {state.isDocOpen && <VZKeyboardShortcutsDoc />}
      {state.modals?.showCreateFile && <CreateFileModal />}
      {state.modals?.showCreateDir && <CreateDirModal />}
      {state.modals?.showDeleteConfirm && <DeleteConfirmationModal />}
      {state.modals?.showVoiceChat && <VoiceChatModal />}

      {/* ——— Quick Open (⌘/Ctrl+P) ——— */}
      <QuickOpenPalette />
    </>
  );
};
