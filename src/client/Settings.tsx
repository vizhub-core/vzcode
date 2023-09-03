import { useCallback } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';
import {
  ThemeLabel,
  themeOptionsByLabel,
  themes,
} from './themes';

const saveTimes = [
  { value: 1, label: '1 second' },
  { value: 5, label: '5 seconds' },
  { value: 10, label: '10 seconds' },
  { value: 30, label: '30 seconds' },
];

export const Settings = ({
  show,
  onClose,
  setTheme,
  theme,
}: {
  show: boolean;
  onClose: () => void;
  setTheme: (theme: ThemeLabel) => void;
  theme: ThemeLabel;
}) => {
  const handleChange = useCallback((selectedOption) => {
    setTheme(selectedOption.label);
  }, []);

  const handleSaveTimeChange = useCallback(
    (selectedOption) => {
      const time = [{ value: selectedOption.value }];
      fetch('/saveTime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(time),
      });
    },
    [],
  );

  return show ? (
    <Modal
      className="vz-settings"
      show={show}
      onHide={onClose}
      animation={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3" controlId="formFork">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
          />
          <Form.Text className="text-muted">
            Enter a username to be displayed on your cursor
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formFork">
          <Form.Label>Theme</Form.Label>
          <Select
            options={themes}
            onChange={handleChange}
            value={themeOptionsByLabel[theme]}
          />
          <Form.Text className="text-muted">
            Select a color theme for the editor
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formFork">
          <Form.Label>Auto-Save Time</Form.Label>
          <Select
            options={saveTimes}
            onChange={handleSaveTimeChange}
          />
          <Form.Text className="text-muted">
            Select an auto save time
          </Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null;
};
