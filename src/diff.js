import * as json1 from 'ot-json1';
import * as textUnicode from 'ot-text-unicode';
import jsondiff from 'json0-ot-diff';
import diffMatchPatch from 'diff-match-patch';

export const diff = (a, b) =>
  jsondiff(a, b, diffMatchPatch, json1, textUnicode);
