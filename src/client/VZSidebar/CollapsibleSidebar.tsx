import { useContext } from "react";
import { VZSidebar } from "./index";
import { VZCodeContext } from "../VZCodeContext";
import type { VZAction, VZState } from "../vzReducer";

export const CollapsibleSidebar = () => {
  const { state, dispatch } = useContext(VZCodeContext) as unknown as {
    state: VZState;
    dispatch: React.Dispatch<VZAction>;
  };

  const { isSidebarOpen = true } = state;
  const toggleSidebarOpen = () => dispatch({ type: "toggleSidebarOpen" });

  return (
    <aside
      className={`relative flex h-full border-r border-zinc-800 bg-zinc-950 transition-[width] duration-200 ease-in-out ${
        isSidebarOpen ? "w-72" : "w-12"
      }`}
    >
      <button
        onClick={toggleSidebarOpen}
        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        className="absolute -right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700"
      >
        <ChevronLeft
          className={`h-4 w-4 transition-transform ${
            isSidebarOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div className="flex-1 overflow-hidden">
        <VZSidebar />
      </div>
    </aside>
  );
};
