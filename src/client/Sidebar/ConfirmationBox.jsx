import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export const ConfirmationBox = (props) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <Modal
          show={props.show}
          close={props.onClose}
          confirm={props.onConfirm}
          centered
        >
          <Modal.Header closeButton onClick={props.onClose}>
            <Modal.Title>Delete File</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>
              Are you sure you want to delete this file?
            </p>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="primary"
              onClick={props.onConfirm}
            >
              Yes
            </Button>
            <Button
              variant="secondary"
              onClick={props.onClose}
            >
              No
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};
