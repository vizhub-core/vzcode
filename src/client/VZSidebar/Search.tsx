import {
  JavaScriptSVG,
  TypeScriptSVG,
  ReactSVG,
  SvelteSVG,
  JsonSVG,
  MarkdownSVG,
  HtmlSVG,
  CssSVG,
  SearchFileSVG
} from '../Icons';
import {
  useRef,
  useEffect,
  useContext,
} from "react";
import { Form } from "../bootstrap";
import { VZCodeContext } from "../VZCodeContext";
import { SearchFile } from '../../types';

function getExtensionIcon(extension: string) {
  switch(extension) {
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

export const Search = () => {
  const { search, setSearch, jumpToSearch, setActiveFileLeft, setSearchResults, shareDBDoc } = useContext(VZCodeContext);
  const pattern = search.pattern;
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Search about 1 second after entering pattern
    const delaySearch = setTimeout(() => {
      if (pattern.trim().length >= 1) {
        setSearchResults(shareDBDoc);
        console.log(search);
      }
    }, 2000);

    return () => clearTimeout(delaySearch);
  }, [search.pattern]);

  return (
    <div>
      <Form.Group
        className="sidebar-search-form mb-3"
        controlId="searchName"
      >
        <h4>Search</h4>
        <Form.Control
          type="text"
          value={search.pattern}
          onChange={(e) => setSearch(e.target.value)}
          ref={inputRef}
          spellCheck="false"
        />
      </Form.Group>
      {(pattern.length >= 1 && pattern.trim().length >= 1) ? (
        <div className="search-results">
          {
            search.results.map((file : SearchFile) => (
              <div className="search-result" key={file.name}>
                <div className="search-result-heading">
                  <div className="search-result-name">
                    {
                      getExtensionIcon(file.name.split(".")[1])
                    }
                    <h5>{file.name}</h5>
                  </div>
                  <h6 className="search-result-count">{file.lines.length}</h6>
                </div>
                <div className="search-result-lines">
                  {
                    file.lines.map((line) => {
                      const before = line.text.substring(0, line.index);
                      const match = line.text.substring(line.index, line.index + pattern.length);
                      const after = line.text.substring(line.index + pattern.length);
                      return (
                        <p 
                          className = "search-line" key = {file.name + " - " + line.line + " - " + line.index}
                          onClick={() => {
                            jumpToSearch(shareDBDoc, file.id, line.line);
                            setActiveFileLeft();
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
          <h4>No Results</h4>
        </div>
      )
      }
    </div>

  );
};
