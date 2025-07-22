import { VizHubRuntime } from "@vizhub/runtime";
import { VizHubRuntimeFixture } from "./fixtures/types";

let currentExample: string;

export const demoButtons = (
  runtime: VizHubRuntime,
  fixtures: Array<VizHubRuntimeFixture>,
) => {
  // Get the button container from the DOM
  const buttonContainer = document.getElementById(
    "button-container",
  );

  if (!buttonContainer) {
    console.error("Button container not found");
    return;
  }

  // Create buttons from configurations
  fixtures.forEach(({ label, files, status, vizId }) => {
    const button = document.createElement("button");
    button.textContent = label;
    button.className = "status-" + status;

    // Add event listener
    button.addEventListener("click", () => {
      console.log(`Loading ${label}...`);
      runtime.run({
        files,

        // Enable hot reloading when running the same example twice
        enableHotReloading: label === currentExample,
        vizId,
      });
      currentExample = label;
    });

    buttonContainer.appendChild(button);
  });
};