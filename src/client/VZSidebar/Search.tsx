import {
  useRef,
  useEffect,
  useContext,
  useState,
} from 'react';
import { Form } from '../bootstrap';
import { VZCodeContext } from '../VZCodeContext';
import { SearchFile } from '../../types';
import { EditorView } from 'codemirror';
import { getExtensionIcon } from './FileListing';
import { CloseSVG, DirectoryArrowSVG } from '../Icons';

function jumpToPattern(
  editor: EditorView,
  pattern: string,
  line: number,
  index: number,
) {
  const position: number =
    editor.state.doc.line(line).from + index;

  editor.dispatch({
    selection: {
      anchor: position,
      head: position + pattern.length,
    },
    scrollIntoView: true,
    effects: EditorView.scrollIntoView(position, {
      y: 'center',
    }),
  });
}

export const Search = () => {
  const inputRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const {
    search,
    setSearch,
    setActiveFileId,
    openTab,
    setSearchResults,
    setSearchFileVisibility,
    setSearchActiveElement,
    shareDBDoc,
    editorCache,
  } = useContext(VZCodeContext);
  const { pattern, results, activeElement } = search;

  useEffect(() => {
    if (isMounted) {
      // Only conduct a search after fully mounting and entering a new non-empty pattern
      setIsSearching(pattern.trim().length >= 1);

      // Search about 2 seconds after entering a new pattern
      const delaySearch = setTimeout(() => {
        if (
          pattern.trim().length >= 1 &&
          inputRef.current
        ) {
          setSearchResults(shareDBDoc);
          setIsSearching(false);
        }
      }, 2000);

      return () => clearTimeout(delaySearch);
    } else {
      setIsMounted(true);
      inputRef.current.focus();
    }
  }, [pattern]);

  return (
    <div>
      <Form.Group
        className="sidebar-search-form mb-3"
        controlId="searchName"
      >
        <Form.Control
          type="text"
          value={pattern}
          onChange={(e) => setSearch(e.target.value)}
          ref={inputRef}
          spellCheck="false"
        />
      </Form.Group>
      {Object.keys(results).length >= 1 &&
      pattern.trim().length >= 1 ? (
        <div className="search-results">
          {Object.entries(results)
            .filter(
              ([_, file]) => file.visibility !== 'closed',
            )
            .map(([fileId, file]: [string, SearchFile]) => (
              <div
                className="search-result"
                key={file.name}
              >
                <div 
                  onMouseOver={() => {
                    if (activeElement !== file.name) {
                      setSearchActiveElement(file.name);
                    }
                  }}
                  onClick={() => {
                    setSearchFileVisibility(
                      shareDBDoc,
                      fileId,
                      file.visibility === 'open'
                        ? 'flattened'
                        : 'open',
                      file.name,
                    );
                  }}
                  className={`search-file-heading ${file.name === activeElement ? 'active' : ''}`}
                  >
                  <div className="search-file-title">
                    <div
                      className="arrow-wrapper"
                      style={{
                        transform: `rotate(${file.visibility === 'open' ? 90 : 0}deg)`,
                      }}
                    >
                      <DirectoryArrowSVG />
                    </div>
                    <div className="search-file-name">
                      {getExtensionIcon(file.name)}
                      <h5>{file.name}</h5>
                    </div>
                  </div>
                  <div className="search-file-info">
                    {
                      file.name === activeElement ? (
                          <span 
                            className="search-file-close"
                            onClick={(event) => {
                              event.stopPropagation();
                              
                              setSearchFileVisibility(
                                shareDBDoc,
                                fileId,
                                'closed',
                                null
                              );
                            }}
                          >
                            <CloseSVG />
                          </span>
                      ) : (
                          <h6 className="search-file-count">
                            {file.matches.length}
                          </h6>
                      )
                    }
                  </div>
                </div>
                <div 
                  className="search-file-lines">
                  {file.visibility != 'flattened' &&
                    file.matches.filter((match) => !(match.isClosed)).map((match) => {
                      const before = match.text.substring(
                        0,
                        match.index,
                      );
                      const hit = match.text.substring(
                        match.index,
                        match.index + pattern.length,
                      );
                      const after = match.text.substring(
                        match.index + pattern.length,
                      );
                      const identifier = file.name + "-" + match.line;

                      return (
                        <div
                          key={identifier}
                          className={`search-line ${identifier === activeElement ? 'active' : ''}`}
                          >
                            <p
                            
                            key={
                              file.name +
                              ' - ' +
                              match.line +
                              ' - ' +
                              match.index
                            }
                            onMouseOver={() => {
                              if (activeElement !== identifier) {
                                setSearchActiveElement(identifier);
                              }
                            }}
                            onClick={() => {
                              setSearchActiveElement(identifier);
                              setActiveFileId(fileId);
                              openTab({
                                fileId: fileId,
                                isTransient: false,
                              });

                              if (editorCache.get(fileId)) {
                                jumpToPattern(
                                  editorCache.get(fileId)
                                    .editor,
                                  pattern,
                                  match.line,
                                  match.index,
                                );
                              }
                            }}
                          >
                            {before}
                            <span className="search-pattern">
                              {hit}
                            </span>
                            {after}
                          </p>
                          {
                          activeElement === identifier && (
                            <span
                              className="search-file-close"
                              onClick={(event) => {
                                event.stopPropagation();
                              }}
                            >
                              <CloseSVG />
                            </span>  
                            )
                          }
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="search-state">
          <h6>
            {isSearching ? 'Searching...' : 'No Results'}
          </h6>
        </div>
      )}
    </div>
  );
};
