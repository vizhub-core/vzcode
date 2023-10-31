import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { Modal, Form, Button } from '../bootstrap';

export const CreateFileModal = ({
  show,
  onClose,
  onRename,
  initialFileName,
}) => {
  const [newName, setNewName] = useState(initialFileName);
  const inputRef = useRef(null);

  useEffect(() => {
    if (show && inputRef.current) {
      inputRef.current.focus();
    }
  }, [show]);

  const handleNameChange = useCallback((event) => {
    setNewName(event.target.value);
  }, []);

  const handleRenameClick = useCallback(() => {
    onRename(newName);
  }, [newName, onRename]);

  const handleKeyDown = useCallback(
    (e) => {
      if (
        e.key === 'Enter' &&
        (e.ctrlKey ||
          e.shiftKey ||
          (!e.altKey && !e.metaKey))
      ) {
        handleRenameClick();
      }
    },
    [handleRenameClick],
  );

  return show ? (
    <Modal
      show={show}
      onHide={onClose}
      animation={false}
      onKeyDown={handleKeyDown}
    >
      <Modal.Header closeButton>
        <Modal.Title>Rename File</Modal.Title>
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
            Enter the new name for your file
          </Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={handleRenameClick}
        >
          Rename
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null;
};