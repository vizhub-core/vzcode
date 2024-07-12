import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useContext,
} from 'react';
import { Modal, Form, Button } from '../bootstrap';
import { VZCodeContext } from '../VZCodeContext';
import { validateFileName } from './validateFileName';

export const CreateFileModal = ({
  initialFileName = '',
}) => {
  const [newName, setNewName] = useState(initialFileName);
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
  }, []);

  const onCreateClick = useCallback(() => {
    handleCreateFileClick(newName);
    setNewName('');
  }, [newName, handleCreateFileClick]);

  const handleKeyDown = useCallback(
    (e) => {
      if (
        e.key === 'Enter' &&
        validateFileName({ files, fileName: newName }) &&
        (e.ctrlKey ||
          e.shiftKey ||
          (!e.altKey && !e.metaKey))
      ) {
        onCreateClick();
      }
    },
    [onCreateClick, newName],
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
          />
          <Form.Text className="text-muted">
            Enter the name for your file
          </Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={onCreateClick}
          disabled={
            !validateFileName({ files, fileName: newName })
          }
        >
          Create File
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null;
};
