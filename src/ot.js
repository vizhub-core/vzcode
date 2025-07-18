// Operational Transformation (OT) utilities.
// This file is the central point where the OT types are imported.
// Localized to one file so it's easy to change it in future.
import OTJSON1Presence from 'sharedb-client-browser/dist/ot-json1-presence-umd.cjs';

export const { json1Presence, textUnicode } =
  OTJSON1Presence;

// The OT type used throughout the codebase.
export const otType = json1Presence.type;

// Applies an OT op to an object.
export const apply = otType.apply;
