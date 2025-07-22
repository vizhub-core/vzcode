// Displays the Vite devserver iframe.
// TODO test this out, think this through.
// Purpose: support folks using VZCode as the editor
// for their Vite-based projects.
import "./style.css";
import "@vizhub/runtime";

import BuildWorker from "./buildWorker?worker";
//import { demoButtons } from "./demoButtons";
import { fixtures } from "./fixtures";

const enableIframe = true;

export const VZRight = () => {
  return (
    <div className="right">
      {enableIframe ? (
        <iframe src="http://localhost:5173/"></iframe>
      ) : null}
    </div>
  );
};


// Get the iframe from the DOM
const iframe = document.getElementById(
  "viz-iframe",
) as HTMLIFrameElement;

// Initialize the worker
const worker = new BuildWorker();

// Create the runtime in the iframe context
const runtime: VizHubRuntime = createRuntime({
  iframe,
  worker,
  resolveSlugKey: async (slugKey: string) => {
    const fixture = fixtures.find(
      (fixture) => fixture.slugKey === slugKey,
    );
    if (!fixture || !fixture.vizId) {
      return null;
    }
    return fixture.vizId;
  },
  getLatestContent: async (vizId) => {
    const fixture = fixtures.find(
      (fixture) => fixture.vizId === vizId,
    );
    if (!fixture) {
      return null;
    }
    return createVizContent(
      fixture.files,
      fixture.label,
      fixture.vizId,
    );
  },
  setBuildErrorMessage: (message) => {
    message && console.error("Build error:", message);
  },
});

// Expose runtime on the parent window for testing
window.runtime = runtime;

demoButtons(runtime, fixtures);
