import { useContext, useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { VZCodeContext } from '../VZCodeContext';

export function VoiceChatModal() {
  const {
    liveKitRoomName,
    setLiveKitRoom,
    liveKitToken,
    setLiveKitToken,
    liveKitConnection,
    setLiveKitConnection,
    voiceChatModalOpen,
    setVoiceChatModalOpen,
  } = useContext(VZCodeContext);

  const [roomName, setRoomName] = useState(
    liveKitRoomName || '',
  );
  const [token, setToken] = useState(liveKitToken || '');

  const handleConnect = () => {
    setLiveKitRoom(roomName);
    setLiveKitToken(token);
    setVoiceChatModalOpen(false);
  };

  const handleClose = () => {
    setVoiceChatModalOpen(false);
  };

  useEffect(() => {
    console.log(
      'FJKDNFKJNDALKJFNDLKJN',
      voiceChatModalOpen,
    );
  }, [voiceChatModalOpen]);
  return (
    <Modal
      className="vz-settings"
      show={voiceChatModalOpen}
      onHide={handleClose}
      animation={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Connect to LiveKit Room</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formRoomName">
            <Form.Label>Room Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </Form.Group>
          <Form.Group
            controlId="formToken"
            className="mt-3"
          >
            <Form.Label>Token</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConnect}>
          Connect
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
