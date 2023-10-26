import { Button, Modal } from '../bootstrap';

// Confirmation modal for deleting a file or directory.
// Inspired by https://react-bootstrap.netlify.app/docs/components/modal/#live-demo
export const DeleteConfirmationModal = ({
  show,
  onClose,
  onConfirm,
  isDirectory,
  name,
}) => (
  <Modal show={show} onHide={onClose} centered>
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
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onConfirm}>
        Delete
      </Button>
    </Modal.Footer>
  </Modal>
);
