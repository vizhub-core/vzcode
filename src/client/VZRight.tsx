// Displays the Vite devserver iframe.
// TODO test this out, think this through.
// Purpose: support folks using VZCode as the editor
// for their Vite-based projects.
import "./style.css";
import "@vizhub/runtime";

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

