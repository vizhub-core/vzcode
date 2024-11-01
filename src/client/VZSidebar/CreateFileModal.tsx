import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useContext,
} from 'react';
import { Modal, Form, Button } from '../bootstrap';
import { VZCodeContext } from '../VZCodeContext';

export const CreateFileModal = ({
  initialFileName = '',
}) => {
  const [newName, setNewName] = useState(initialFileName);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const {
    files,
    isCreateFileModalOpen,
    handleCloseCreateFileModal,
    handleCreateFileClick,
  } = useContext(VZCodeContext);

  useEffect(() => {
    if (isCreateFileModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreateFileModalOpen]);

  const handleNameChange = useCallback((event) => {
    setNewName(event.target.value);
    setError(''); // Clear error on new input
  }, []);

  const onCreateClick = useCallback(() => {
    if (validateFileName(newName)) {
      handleCreateFileClick(newName);
      setNewName('');
      setError('');
    } else {
      setError('Invalid or duplicate filename.');
    }
  }, [newName, handleCreateFileClick, validateFileName]);

  const validateFileName = useCallback(
    (fileName) => {
      const regex = /^[a-zA-Z0-9](?:[a-zA-Z0-9 ./+=_-]*[a-zA-Z0-9])?$/;
      if (!regex.test(fileName)) return false;
      return !Object.values(files).some((file) => file.name === fileName);
    },
    [files],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (
        e.key === 'Enter' &&
        validateFileName(newName) &&
        (e.ctrlKey ||
          e.shiftKey ||
          (!e.altKey && !e.metaKey))
      ) {
        onCreateClick();
      }
    },
    [onCreateClick, validateFileName, newName],
  );

  return isCreateFileModalOpen ? (
    <Modal
      show={isCreateFileModalOpen}
      onHide={handleCloseCreateFileModal}
      animation={false}
      onKeyDown={handleKeyDown}
    >
      <Modal.Header closeButton>
        <Modal.Title>Create File</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3" controlId="fileName">
          <Form.Label>File Name</Form.Label>
          <Form.Control
            type="text"
            value={newName}
            onChange={handleNameChange}
            ref={inputRef}
            spellCheck="false"
            aria-describedby="fileNameHelp"
            isInvalid={!!error}
          />
          <Form.Text id="fileNameHelp" className="text-muted">
            Enter the name for your file.
          </Form.Text>
          {error && <Form.Text className="text-danger">{error}</Form.Text>}
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={onCreateClick}
          disabled={!validateFileName(newName)}
        >
          Create File
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null;
};
