import {
  useEffect,
  useCallback,
  useContext,
  Fragment,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
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
import { ThemeToggleButton } from "./ThemeToggleButton";

import { ActionType } from './actionTypes'; // Ensure this path is correct

export const VZRoot = () => {
    const { state, dispatch } = useContext(VZCodeContext) as { state: any; dispatch: React.Dispatch<ActionType> };

  /* ——— global keyboard shortcuts ——— */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent | ReactKeyboardEvent) => {
      // Quick Open
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        dispatch({ type: "quickOpen.show" });
        return;
      }
      if (e.key === "Escape") {
        dispatch({ type: "quickOpen.hide" });
        return;
      }

      // Reopen closed tab
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        const last = state.closedTabs[0];
        if (last) {
          dispatch({ type: "openTab", filename: last });
          dispatch({ type: "tabs.popClosed" });
        }
        return;
      }

      // Zen Mode
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: "zen.toggle" });
        return;
      }

      // Theme toggle  (Ctrl/⌘ + Shift + L)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        dispatch({ type: "theme.toggle" });
      }
    },
    [dispatch, state.closedTabs]
  );

  /* attach listener once */
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  /* Apply theme class to <html> so Tailwind/daisyUI etc. can respond */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-light", state.theme === "light");
    root.classList.toggle("theme-dark", state.theme === "dark");
  }, [state.theme]);

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

      {/* ——— Global UI helpers ——— */}
      <ThemeToggleButton />
      <QuickOpenPalette />
    </Fragment>
  );
};
