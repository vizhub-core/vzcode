import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button, Modal, Form } from './bootstrap';
import { ThemeLabel, themes } from './themes';
import { VZCodeContext } from './VZCodeContext';
import { fonts } from './Fonts/fonts';

const fontSizes = ['16px', '18px', '20px', '24px'];

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

  const handleThemeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setTheme(event.target.value as ThemeLabel);
    },
    [],
  );

  // Track selected font and font size.
  // TODO store these in local storage
  const [selectedFont, setSelectedFont] =
    useState('Roboto Mono');
  const [selectedFontSize, setSelectedFontSize] =
    useState('16px');

  // Called when the user selects a different font
  const handleFontChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedFont(event.target.value);
    },
    [],
  );

  // Called when the user selects a different font size
  const handleFontSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedFontSize(event.target.value);
  };

  useEffect(() => {
    document.body.style.setProperty(
      '--vzcode-font-family',
      selectedFont,
    );
  }, [selectedFont]);

  useEffect(() => {
    document.body.style.setProperty(
      '--vzcode-font-size',
      selectedFontSize,
    );
  }, [selectedFontSize]);

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
            value={selectedFont}
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
            onChange={handleFontSizeChange}
            value={selectedFontSize}
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

        {/* Keyboard Shortcuts Documentation */}
        <Form.Group className="mb-3" controlId="formFork">
          <Form.Label>Keyboard Shortcuts</Form.Label>
          <ul>
            <li>
              <strong>Alt-w</strong> <span>⌥W</span>
              <br />
              <span>Close the current tab</span>
            </li>
            <li>
              <strong>Alt-n</strong> <span>⌥N</span>
              <br />
              <span>Open the create file modal</span>
            </li>
            <li>
              <strong>Alt-PageUp</strong> <span>⌥⇞</span>
              <br />
              <span>
                Change the active tab to the previous one
              </span>
            </li>
            <li>
              <strong>Alt-PageDown</strong> <span>⌥⇟</span>
              <br />
              <span>
                Change the active tab to the next one
              </span>
            </li>
            <li>
              <strong>Ctrl-s</strong> or{' '}
              <strong>Shift-Enter</strong> <span>⌘S</span>{' '}
              or <span>⇧↩</span>
              <br />
              <span>
                Run the code and format it with Prettier
              </span>
            </li>
          </ul>
          <Form.Text className="text-muted">
            Keyboard shortcuts for quick actions
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
