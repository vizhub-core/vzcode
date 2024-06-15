import {
   useState,
   useCallback,
   useRef,
   useEffect,
   useContext,
 } from 'react';
 import { Form } from '../bootstrap';
 import { VZCodeContext } from '../VZCodeContext';
 
 export const Search = ({
   initialSearch = '',
 }) => {
   const [results, setResults] = useState([]);
   const inputRef = useRef(null);
 
   const {
    isFilesToggled,
    handleSearch
   } = useContext(VZCodeContext);
 
   useEffect(() => {
     if (isFilesToggled && inputRef.current) {
      inputRef.current.focus();
     }
   }, [isFilesToggled]);
 
   const handleSearchChange = useCallback((event) => {
     handleSearch(event.target.value);
     setResults([]);
   }, []);

 
   return (
      <div>
        <Form.Group 
          className="sidebar-search-form mb-3" 
          controlId="searchName"
          >
            <Form.Label>Search</Form.Label>
            <Form.Control
              type="text"
              onChange={handleSearchChange}
              ref={inputRef}
              spellCheck="false"
            />
        </Form.Group>
        { (results.length > 0) ? (
            <p>HELLO2</p>
          ) : null
        }
      </div>
     
   );
 };
 