import { FileCollection, VizId } from "@vizhub/viz-types";

export type VizHubRuntimeFixture = {
  // Label for button
  label: string;
  status: "working" | "failing";
  files: FileCollection;

  // For testing V3 cross-viz imports only
  slugKey?: string;
  vizId?: VizId;
};