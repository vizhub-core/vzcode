import { useCallback, useContext, useRef } from 'react';
import { Button, Modal, Form } from './bootstrap';
import { themes } from './themes';
import { VZCodeContext } from './VZCodeContext';
import { fonts } from './Fonts/fonts';

export const VZSettings = ({
  enableUsernameField = true,
}: {
  // Feature flag to enable/disable username field
  enableUsernameField?: boolean;
}) => {
  const {
    isSettingsOpen,
    closeSettings,
    theme,
    setTheme,
    username,
    setUsername,
  } = useContext(VZCodeContext);

  const handleThemeChange = useCallback((event) => {
    const selectedValue = event.target.value;
    console.log(selectedValue);
    setTheme(selectedValue);
  }, []);

  const handleFontChange = (event) => {
    let { body } = document;
    body.style.setProperty(
      '--vzcode-font-family',
      event.target.value,
    );
  };

  const fontSizes = ['16px', '18px', '20px', '24px'];
  const handleFontSize = (event) => {
    let fontSize = event.target.value;
    let root = document.documentElement;
    root.style.setProperty('--vzcode-font-size', fontSize);
  };

  const usernameRef = useRef<HTMLInputElement>(null);

  const handleUsernameChange = useCallback(() => {
    setUsername(usernameRef.current?.value || '');
  }, [setUsername]);

  return isSettingsOpen ? (
    <Modal
      className="vz-settings"
      show={isSettingsOpen}
      onHide={closeSettings}
      animation={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Editor Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {enableUsernameField ? (
          <Form.Group className="mb-3" controlId="formFork">
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

        <Form.Group className="mb-3" controlId="formFork">
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
        <Form.Group className="mb-3" controlId="formFork">
          <Form.Label>Font</Form.Label>
          <select
            className="form-select"
            onChange={handleFontChange}
          >
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
          <Form.Text className="text-muted">
            Select font for the editor
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formFork">
          <Form.Label>Font Size</Form.Label>
          <select
            className="form-select"
            onChange={handleFontSize}
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <Form.Text className="text-muted">
            Select a font size for the editor
          </Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={closeSettings}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null;
};
