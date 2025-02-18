// These import are wreaking havoc with the build process
// and causing app deployments to fail.
// The upstream library is not configured properly in NPM.
// See:
// https://github.com/uiwjs/react-codemirror/issues/680
// https://github.com/scalar/scalar/issues/4222
// As a workaround, we need to explicitly target the ESM
// distribution of the library, which is not used by default
// because there is no "type": "module" field in the package.json
// of any of these `@uiw/codemirror-theme-*` packages.

import { okaidia } from '@uiw/codemirror-theme-okaidia/esm/index.js';
import { abcdef } from '@uiw/codemirror-theme-abcdef/esm/index.js';
import { dracula } from '@uiw/codemirror-theme-dracula/esm/index.js';
import { eclipse } from '@uiw/codemirror-theme-eclipse/esm/index.js';
import { githubDark } from '@uiw/codemirror-theme-github/esm/index.js';
import { material } from '@uiw/codemirror-theme-material/esm/index.js';
import { nord } from '@uiw/codemirror-theme-nord/esm/index.js';
import { xcodeLight } from '@uiw/codemirror-theme-xcode/esm/index.js';
import { createTheme } from '@uiw/codemirror-themes/esm/index.js';

export {
  okaidia,
  abcdef,
  dracula,
  eclipse,
  githubDark,
  material,
  nord,
  xcodeLight,
  createTheme,
};
