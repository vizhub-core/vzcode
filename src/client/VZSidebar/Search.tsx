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
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [focusedChildIndex, setFocusedChildIndex] = useState(null);

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
  const { pattern, results, focused, activeElement } = search;
  const files: [string, SearchFile][] = Object.entries(results)
    .filter(([_, file]) => file.visibility !== 'closed');

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
    }
  }, [pattern]);

  const flattenResult = (fileId: string, file: SearchFile) => {
    setSearchFileVisibility(
      shareDBDoc,
      fileId,
      file.visibility === 'open'
        ? 'flattened'
        : 'open',
      file.name
    )
  };

  const closeResult = (fileId: string) => {
    setSearchFileVisibility(
      shareDBDoc,
      fileId,
      'closed',
      null
    );
  }

  const handleKeyDown = (event) => {
      event.preventDefault();

      switch (event.key) {
        case 'Tab':
          setFocusedIndex(0);
          setFocusedChildIndex(null);
          break;
        case 'ArrowUp':
          if (focusedChildIndex !== null) {
            setFocusedChildIndex((previousIndex) => Math.max(previousIndex - 1, 0));
          } else {
            setFocusedIndex((previousIndex) => Math.max(previousIndex - 1, 0));
          }
          break;
        case 'ArrowDown':
          if (focusedChildIndex !== null) {
            setFocusedChildIndex((previousIndex) => 
              Math.min(previousIndex + 1, files[focusedIndex][1].matches.length - 1)
            );
          } else {
            setFocusedIndex((previousIndex) => Math.min(previousIndex + 1, files.length - 1));
          }
          break;
        case 'ArrowLeft':
          if (focusedChildIndex !== null) {
            setFocusedChildIndex(null);
          } else {
            flattenResult(files[focusedIndex][0], files[focusedIndex][1]);
          }
          break;
        case 'ArrowRight':
          if (files[focusedIndex][1].visibility !== 'open') {
            flattenResult(files[focusedIndex][0], files[focusedIndex][1]);
          } else if (focusedChildIndex === null) {
            setFocusedChildIndex(0);
          }
          
          break;
        case 'Enter':
        case ' ':
          if (focusedChildIndex !== null) {
            // Jump to line
          } else {
            // Jump to file
          }
          break;
        default:
          break;
      }
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [focused]);

  return (
    <div>
      <Form.Group
        className="sidebar-search-form mb-3"
        controlId="searchName"
      >
        <Form.Control
          type="text"
          value={pattern}
          onChange={(event) => setSearch(event.target.value)}
          ref={inputRef}
          spellCheck="false"
        />
      </Form.Group>
      {Object.keys(results).length >= 1 &&
      pattern.trim().length >= 1 ? (
        <div 
          onKeyDown={handleKeyDown}
          tabIndex={0} 
          className="search-results">
          {files.map(([fileId, file]: [string, SearchFile], index) => (
              <div
                className="search-result"
                key={file.name}
              >
                <div 
                  onClick={() => {
                    flattenResult(fileId, file);
                  }}
                  className={`search-file-heading 
                      ${(focusedIndex == index && focusedChildIndex == null)  
                      ? 'active' : ''}`}
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
                      (index == focusedIndex && focusedChildIndex == null) ? (
                          <span 
                            className="search-file-close"
                            onClick={(event) => {
                              event.stopPropagation();
                              
                              closeResult(fileId);
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
                    file.matches.filter((match) => !(match.isClosed)).map((match, childIndex) => {
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
                          tabIndex={(index == focusedIndex) ? 0 : -1} 
                          className={`search-line 
                              ${(focusedChildIndex == childIndex && focusedIndex == index) 
                                ? 'active' : ''}`}
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
