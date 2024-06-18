import {
  useState,
  useRef,
  useEffect,
  useContext,
} from 'react';
import { Form } from '../bootstrap';
import { VZCodeContext } from '../VZCodeContext';

export const Search = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  const { handleSearch } = useContext(VZCodeContext);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Search about 1 second after entering pattern
    const delaySearch = setTimeout(() => {
      console.log(`Will search now - ${search}`);
      // handleSearch(search);
      // setResults({});
    }, 1000);

    return () => clearTimeout(delaySearch);
  }, [search, handleSearch]);

  return (
    <div>
      <Form.Group
        className="sidebar-search-form mb-3"
        controlId="searchName"
      >
        <Form.Label>Search</Form.Label>
        <Form.Control
          type="text"
          value={search}
          onChange={(e) => {setSearch(e.target.value);}}
          ref={inputRef}
          spellCheck="false"
        />
      </Form.Group>
      {(results.length > 0) ? (
        <div className='search-results'>
          <p>Results</p>
        </div>

      ) : (
        <div className='search-results'>
          <p>No Results</p>
        </div>
      )
      }
    </div>

  );
};
