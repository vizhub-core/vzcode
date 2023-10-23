import React from 'react';
import { Button, Modal } from '../bootstrap';

// Inspired by https://react-bootstrap.netlify.app/docs/components/modal/#live-demo
export const ConfirmationBox = ({
  show,
  onClose,
  onConfirm,
}) => (
  <Modal
    show={show}
    onHide={onClose}
    // confirm={onConfirm}
    centered
  >
    <Modal.Header closeButton onClick={onClose}>
      <Modal.Title>Delete File</Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <p>Are you sure you want to delete this file?</p>
    </Modal.Body>

    <Modal.Footer>
      <Button variant="primary" onClick={onConfirm}>
        Yes
      </Button>
      <Button variant="secondary" onClick={onClose}>
        No
      </Button>
    </Modal.Footer>
  </Modal>
);
