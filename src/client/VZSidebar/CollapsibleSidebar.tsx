import { useContext } from "react";
import { ChevronLeft } from "lucide-react";

// Context returns a tuple: [state, dispatch]
import { VZStateContext } from "../VZStateContext";

import { VZSidebar } from "./index";

export const CollapsibleSidebar = () => {
  // ⬇️ Tuple‑style destructuring matches your existing context value
  const [state, dispatch] = useContext(VZStateContext);
  const { isSidebarOpen = true } = state;

  const toggle = () => dispatch({ type: "toggleSidebarOpen" });

  return (
    <aside
      className={`relative border-r border-zinc-800 bg-zinc-950 flex h-full ${
        isSidebarOpen ? "w-72" : "w-12"
      } transition-[width] duration-200 ease-in-out`}
    >
      {/* Toggle handle */}
      <button
        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        onClick={toggle}
        className="absolute -right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700"
      >
        <ChevronLeft
          className={`h-4 w-4 transition-transform ${
            isSidebarOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Explorer / file tree */}
      <div className="flex-1 overflow-hidden">
        <VZSidebar />
      </div>
    </aside>
  );
};
