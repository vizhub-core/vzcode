import jsondiff from 'json0-ot-diff';
import diffMatchPatch from 'diff-match-patch';
import { json1Presence, textUnicode } from './ot.js';

export const diff = (a, b) =>
  jsondiff(a, b, diffMatchPatch, json1Presence, textUnicode);
