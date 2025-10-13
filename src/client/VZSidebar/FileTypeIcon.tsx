import { useMemo } from 'react';
import {
  FileSVG,
  JavaScriptSVG,
  TypeScriptSVG,
  ReactSVG,
  SvelteSVG,
  JsonSVG,
  MarkdownSVG,
  HtmlSVG,
  CssSVG,
} from '../Icons';

export function getExtensionIcon(fileName: string) {
  const extension = fileName.split('.');

  switch (extension[extension.length - 1]) {
    case 'jsx':
    case 'tsx':
      return <ReactSVG />;
    case 'js':
      return <JavaScriptSVG />;
    case 'ts':
      return <TypeScriptSVG />;
    case 'json':
      return <JsonSVG />;
    case 'md':
    case 'prompt':
      return <MarkdownSVG />;
    case 'html':
      return <HtmlSVG />;
    case 'css':
      return <CssSVG />;
    case 'svelte':
      return <SvelteSVG />;
    default:
      return <FileSVG />;
  }
}

// Various neat icons based on the file extension
export const FileTypeIcon = ({
  name,
}: {
  name: string;
}) => (
  <i className="file-icon">
    {useMemo(() => getExtensionIcon(name), [name])}
  </i>
);
