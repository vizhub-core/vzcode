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
  createDirectory = false,
  itemText = createDirectory ? 'Directory' : 'File',
}) => {
  const [newName, setNewName] = useState(initialFileName);
  const inputRef = useRef(null);

  const {
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
  }, []);

  const onCreateClick = useCallback(() => {
    handleCreateFileClick(newName);
    setNewName('');
  }, [newName, handleCreateFileClick]);

  // Returns true if file name is valid, false otherwise.
  const validateFileName = useCallback(
    (fileName: string) => {
      const regex =
        /^[a-zA-Z0-9](?:[a-zA-Z0-9 ./+=_-]*[a-zA-Z0-9])?$/;
      return regex.test(fileName);
    },
    [],
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
      show={isCreateFileModalOpen && !createDirectory}
      onHide={handleCloseCreateFileModal}
      animation={false}
      onKeyDown={handleKeyDown}
    >
      <Modal.Header closeButton>
        <Modal.Title>Create {itemText}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3" controlId="fileName">
          <Form.Label>{itemText} Name</Form.Label>
          <Form.Control
            type="text"
            value={newName}
            onChange={handleNameChange}
            ref={inputRef}
            spellCheck="false"
          />
          <Form.Text className="text-muted">
            Enter the name for your {itemText}
          </Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={onCreateClick}
          disabled={!validateFileName(newName)}
        >
          Create {itemText}
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null;
};
