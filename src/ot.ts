// Operational Transformation (OT) utilities.
// This file is the central point where the OT types are imported.
// Localized to one file so it's easy to change it in future.
import OTJSON1Presence from 'sharedb-client-browser/dist/ot-json1-presence-umd.cjs';
import jsondiff from 'json0-ot-diff';
import {
  diff_match_patch as DiffMatchPatch,
  DIFF_DELETE,
  DIFF_INSERT,
  DIFF_EQUAL,
} from '@dmsnell/diff-match-patch';

// Attach the constants to the class as static properties for compatibility with json0-ot-diff
DiffMatchPatch.DIFF_DELETE = DIFF_DELETE;
DiffMatchPatch.DIFF_INSERT = DIFF_INSERT;
DiffMatchPatch.DIFF_EQUAL = DIFF_EQUAL;

const diffMatchPatch = DiffMatchPatch;

export const { json1Presence, textUnicode } =
  OTJSON1Presence;

// The OT type used throughout the codebase.
export const otType = json1Presence.type;

// Applies an OT op to an object.
export const apply = otType.apply;

export const diff = (a, b) =>
  jsondiff(
    a,
    b,
    diffMatchPatch,
    json1Presence,
    textUnicode,
  );
