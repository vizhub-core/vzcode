import { Button, Modal } from '../bootstrap';
import { useCallback } from 'react';

// Confirmation modal for deleting a file or directory.
// Inspired by https://react-bootstrap.netlify.app/docs/components/modal/#live-demo

export const DeleteConfirmationModal = ({
  show,
  onClose,
  onConfirm,
  isDirectory,
  name,
}) => {
  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      onConfirm();
    },
    [onConfirm],
  );

  return (
    <Modal show={show} onHide={onClose} centered>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton onClick={onClose}>
          <Modal.Title>
            Delete {isDirectory ? 'Directory' : 'File'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            This will delete the{' '}
            {isDirectory ? 'directory' : 'file'}{' '}
            <strong>{name}</strong>.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Delete
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
