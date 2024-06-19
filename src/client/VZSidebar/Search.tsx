import {
  JavaScriptSVG,
  TypeScriptSVG,
  ReactSVG,
  JsonSVG,
  MarkdownSVG,
  HtmlSVG,
  CssSVG,
  FileSVG
} from '../Icons';
import {
  useState,
  useRef,
  useEffect,
  useContext,
} from "react";
import { Form } from "../bootstrap";
import { VZCodeContext } from "../VZCodeContext";
import { ShareDBDoc, VZCodeContent } from "../../types";

type File = {
  id: string;
  name: string;
  extension: string;
  lines: Array<{line: number, index: number, text: string }>;
}

function getIcon(extension: string) {
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
    default:
      return <FileSVG />;
  }
}

function searchFiles(shareDBDoc: ShareDBDoc<VZCodeContent>, pattern: string): Array<File> {
  let results: Array<File> = [];

  const files = shareDBDoc.data.files
  const fileIds = Object.keys(shareDBDoc.data.files);

  for (let i = 0; i < fileIds.length; i++) {
    const file = files[fileIds[i]];  

    if (files[fileIds[i]].text) {
      const fileName = file.name;
      const fileExtension = fileName.split(".")[1];

      const lines = file.text.split("\n");
      const patterns = [];

      for (let j = 0; j < lines.length; j++) {
        const index = lines[j].indexOf(pattern);

        if (index !== -1) {
          patterns.push({line: j, index: index, text: lines[j]});
        }
      }

      if (patterns.length > 0) {
        results.push({id: fileIds[i], name: fileName, extension: fileExtension, lines: patterns});
      }
    }
  }

  return results;
}

export const Search = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  const { shareDBDoc } = useContext(VZCodeContext);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Search about 1 second after entering pattern
    const delaySearch = setTimeout(() => {
      if (search.trim().length >= 1) {
        setResults(searchFiles(shareDBDoc, search));
      }
    }, 2000);

    return () => clearTimeout(delaySearch);
  }, [search]);

  return (
    <div>
      <Form.Group
        className="sidebar-search-form mb-3"
        controlId="searchName"
      >
        <h4>Search</h4>
        <Form.Control
          type="text"
          value={search}
          onChange={(e) => {setSearch(e.target.value); setResults([]);}}
          ref={inputRef}
          spellCheck="false"
        />
      </Form.Group>
      {(results.length >= 1 && search.trim().length >= 1) ? (
        <div className="search-results">
          {
            results.map((file : File) => (
              <div className="search-result" key={file.name}>
                <div className="search-result-heading">
                  <div className="search-result-name">
                    {
                      getIcon(file.extension)
                    }
                    <h5>{file.name}</h5>
                  </div>
                  <h6 className="search-result-count">{file.lines.length}</h6>
                </div>
                <div className="search-result-lines">
                  {
                    file.lines.map((line) => {
                      const before = line.text.substring(0, line.index);
                      const match = line.text.substring(line.index, line.index + search.length);
                      const after = line.text.substring(line.index + search.length);
                      return (
                        <p className = "search-line" key = {file.name + " - " + line.line + " - " + line.index}>
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
