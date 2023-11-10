// Displays the Vite devserver iframe.
// TODO test this out, think this through.
// Purpose: support folks using VZCode as the editor
// for their Vite-based projects.
const enableIframe = false;
export const Right = () => {
  return (
    <div className="right">
      {enableIframe ? (
        <iframe src="http://localhost:5173/"></iframe>
      ) : null}
    </div>
  );
};
