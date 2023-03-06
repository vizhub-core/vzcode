import OTJSON1Presence from 'sharedb-client-browser/dist/ot-json1-presence-umd.cjs';
import jsondiff from 'json0-ot-diff';
import diffMatchPatch from 'diff-match-patch';

const { json1Presence, textUnicode } = OTJSON1Presence;

export const diff = (a, b) =>
  jsondiff(a, b, diffMatchPatch, json1Presence, textUnicode);
