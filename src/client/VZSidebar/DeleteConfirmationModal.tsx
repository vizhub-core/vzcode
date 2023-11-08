import { Button, Modal } from '../bootstrap';

export const DeleteConfirmationModal = ({
  show,
  onClose,
  onConfirm,
  isDirectory,
  name,
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm();
  };

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
