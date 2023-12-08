import { useCallback, useRef, useEffect } from 'react';
import { Button, Modal, Form } from './bootstrap';
import { ThemeLabel, themes } from './themes';
import { Username } from '../types';

export const VZSettings = ({
  show,
  onClose,
  theme,
  setTheme,
  username,
  setUsername,
  enableUsernameField = true,
}) => {
  const usernameRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = useCallback(
    (event) => {
      const selectedValue = event.target.value;
      console.log(selectedValue);
      setTheme(selectedValue);
    },
    [setTheme],
  );

  // TODO https://github.com/vizhub-core/vzcode/issues/95
  // const handleSaveTimeChange = useCallback(
  //   (selectedOption) => {
  //     const time = [{ value: selectedOption.value }];
  //     fetch('/saveTime', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(time),
  //     });
  //   },
  //   [],
  // );

  const handleUsernameChange = useCallback(() => {
    setUsername(usernameRef.current?.value || '');
  }, [setUsername]);

  const handleEnterKeyPress = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        onClose(); // This assumes onClose will also save changes
        event.preventDefault(); // Prevent the default action
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (show) {
      window.addEventListener(
        'keydown',
        handleEnterKeyPress,
      );
    }
    return () => {
      window.removeEventListener(
        'keydown',
        handleEnterKeyPress,
      );
    };
  }, [show, handleEnterKeyPress]);

  return show ? (
    <Modal
      className="vz-settings"
      show={show}
      onHide={onClose}
      animation={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Editor Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {enableUsernameField ? (
          <Form.Group
            className="mb-3"
            controlId="formUsername"
          >
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              ref={usernameRef}
              onChange={handleUsernameChange}
              placeholder="Enter username"
              value={username}
            />
            <Form.Text className="text-muted">
              Enter a username to be displayed on your
              cursor
            </Form.Text>
          </Form.Group>
        ) : null}

        <Form.Group className="mb-3" controlId="formTheme">
          <Form.Label>Theme</Form.Label>
          <select
            className="form-select"
            value={theme}
            onChange={handleThemeChange}
          >
            {themes.map(({ label }) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
          <Form.Text className="text-muted">
            Select a color theme for the editor
          </Form.Text>
        </Form.Group>
        {/* Future implementation for auto-save time */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null;
};
