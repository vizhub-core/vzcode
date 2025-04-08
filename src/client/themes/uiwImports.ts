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

import { okaidia } from '@uiw/codemirror-theme-okaidia';
import { abcdef } from '@uiw/codemirror-theme-abcdef';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { githubDark } from '@uiw/codemirror-theme-github';
import { material } from '@uiw/codemirror-theme-material';
import { nord } from '@uiw/codemirror-theme-nord';
import { xcodeLight } from '@uiw/codemirror-theme-xcode';
import { createTheme } from '@uiw/codemirror-themes';

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
