import {
  JavaScriptSVG,
  TypeScriptSVG,
  ReactSVG,
  SvelteSVG,
  JsonSVG,
  MarkdownSVG,
  HtmlSVG,
  CssSVG,
  SearchFileSVG,
  DirectoryArrowSVG,
  CloseSVG
} from "../Icons";
import {
  useRef,
  useEffect,
  useContext,
  useState,
} from "react";
import { Form } from "../bootstrap";
import { VZCodeContext } from "../VZCodeContext";
import { SearchFile } from "../../types";
import { EditorView } from "codemirror";

function getExtensionIcon(extension: string) {
  switch (extension) {
    case "jsx": case "tsx":
      return <ReactSVG />;
    case "js":
      return <JavaScriptSVG />;
    case "ts":
      return <TypeScriptSVG />;
    case "json":
      return <JsonSVG />;
    case "md":
      return <MarkdownSVG />;
    case "html":
      return <HtmlSVG />;
    case "css":
      return <CssSVG />;
    case "svelte":
      return <SvelteSVG />;
    default:
      return <SearchFileSVG />;
  }
}

function jumpToPattern(editor: EditorView, pattern: string, line: number, index: number) {
  if (!(editor)) {
    return;
  }
  
  const position: number = editor.state.doc.line(line).from + index;

  editor.dispatch({
    selection: { anchor: position, head: position + pattern.length },
    scrollIntoView: true,
    effects: EditorView.scrollIntoView(position, { y: "center" })
  });
}

export const Search = () => {
  const inputRef = useRef(null);
  const [open, setOpen] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const { search, setSearch, setActiveFileId, openTab, setSearchResults, shareDBDoc, editorCache } = useContext(VZCodeContext);
  const { pattern, results } = search;

  useEffect(() => {
    setIsSearching(pattern.trim().length >= 1);

    // Search about 1 second after entering a new pattern
    const delaySearch = setTimeout(() => {
      if (pattern.trim().length >= 1) {
        setSearchResults(shareDBDoc);
        setIsSearching(false)
      }
    }, 2000);

    return () => clearTimeout(delaySearch);
  }, [pattern]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    let openFiles = {}

    for (const file of results) {
      openFiles[file.id] = "open";
    }

    setOpen(openFiles);
  }, [results]);

  return (
    <div>
      <Form.Group
        className="sidebar-search-form mb-3"
        controlId="searchName"
      >
        <h4>Search</h4>
        <Form.Control
          type="text"
          value={pattern}
          onChange={(e) => setSearch(e.target.value)}
          ref={inputRef}
          spellCheck="false"
        />
      </Form.Group>
      {(results.length >= 1 && pattern.trim().length >= 1 && open) ? (
        <div className="search-results">
          {
            results.filter((file: SearchFile) => open[file.id] !== "removed").map((file: SearchFile) => (
              <div className="search-result" key={file.name}>
                <div className="search-file-heading">
                  <div className="search-file-title">
                    <div
                      className="arrow-wrapper"
                      style={{
                        transform: `rotate(${open[file.id] ? 90 : 0}deg)`,
                      }}
                      onClick={() => {
                        setOpen({ ...open, [file.id]: !(open[file.id]) })
                      }}
                    >
                      <DirectoryArrowSVG />
                    </div>
                    <div className="search-file-name">
                      {
                        getExtensionIcon(file.name.split(".")[1])
                      }
                      <h5>{file.name}</h5>
                    </div>
                  </div>
                  <div className="search-file-info">
                    <h6 className="search-file-count">{file.lines.length}</h6>
                    <div>
                      <CloseSVG />
                    </div>
                  </div>
                </div>
                <div className="search-file-lines">
                  {open[file.id] &&
                    file.lines.map((line) => {
                      const before = line.text.substring(0, line.index);
                      const match = line.text.substring(line.index, line.index + pattern.length);
                      const after = line.text.substring(line.index + pattern.length);
                      return (
                        <p
                          className="search-line" key={file.name + " - " + line.line + " - " + line.index}
                          onClick={() => {
                            setActiveFileId(file.id);
                            openTab({ fileId: file.id, isTransient: true });
                            jumpToPattern(editorCache.get(file.id)?.editor, pattern, line.line, line.index);
                          }}
                        >
                          {before}
                          <span className="search-pattern">{match}</span>
                          {after}
                        </p>
                      );
                    })
                  }
                </div>
              </div>
            ))
          }
        </div>
      ) : (
        <div className="search-results">
          <h4>{isSearching ? "Searching..." : "No Results"}</h4>
        </div>
      )
      }
    </div>

  );
};
