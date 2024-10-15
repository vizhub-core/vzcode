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

const fontSizes = ['10px','12px','14px','16px', '18px', '20px', '24px'];

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

  // Initialize font and size from localStorage or defaults
  // const [selectedFont, setSelectedFont] = useState(
  //   localStorage.getItem('vzcodeSelectedFont') ||
  //     'Roboto Mono',
  // );
  // const [selectedFontSize, setSelectedFontSize] = useState(
  //   localStorage.getItem('vzcodeSelectedFontSize') ||
  //     '16px',
  // );
  const [selectedFont, setSelectedFont] =
    useState('Roboto Mono');
  const [selectedFontSize, setSelectedFontSize] =
    useState('16px');

  useEffect(() => {
    // If we're in the browser,
    if (typeof window !== 'undefined') {
      const selectedFontFromLocalStorage: string | null =
        window.localStorage.getItem('vzcodeSelectedFont');

      const selectedFontSizeFromLocalStorage:
        | string
        | null = window.localStorage.getItem(
        'vzcodeSelectedFontSize',
      );

      if (selectedFontFromLocalStorage !== null) {
        setSelectedFont(selectedFontFromLocalStorage);
      }
      if (selectedFontSizeFromLocalStorage !== null) {
        setSelectedFontSize(
          selectedFontSizeFromLocalStorage,
        );
      }
    } else {
      // If we're not in the browser, use the default initial width.
    }
  }, []);

  // Called when the user selects a different font
  const handleFontChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newFont = event.target.value;
      localStorage.setItem('vzcodeSelectedFont', newFont);
      setSelectedFont(newFont);
    },
    [],
  );

  // Called when the user selects a different font size
  const handleFontSizeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newSize = event.target.value;
      localStorage.setItem(
        'vzcodeSelectedFontSize',
        newSize,
      );
      setSelectedFontSize(newSize);
    },
    [],
  );

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

  // Function to handle pressing Enter key
  useEffect(() => {
    if (isSettingsOpen) {
      const handleEnterKey = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          closeSettings();
        }
      };

      window.addEventListener('keydown', handleEnterKey);
      return () => {
        window.removeEventListener(
          'keydown',
          handleEnterKey,
        );
      };
    }
  }, [isSettingsOpen, closeSettings]);

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

        <Form.Group className="mb-3" controlId="formFork">
          <Form.Label>Rainbow Brackets</Form.Label>
          <select className="form-select">
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
          <Form.Text className="text-muted">
            Toggle Rainbow Brackets
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
