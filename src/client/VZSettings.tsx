import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button, Modal, Form } from './bootstrap';
import { ThemeLabel, themes } from './themes';
import { VZCodeContext } from './VZCodeContext';

const DEBUG = false;

// Font size options for the editor
const fontSizes = [
  '10px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
];

// List of system fonts to be detected for availability
const systemFonts = [
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'Helvetica Neue',
  'Arial',
  'sans-serif',
  'Courier New',
  'Georgia',
  'Tahoma',
  'Verdana',
  'Times New Roman',
  'Trebuchet MS',
  'Comic Sans MS',
];

// Utility function to detect if a given font is available
const isFontAvailable = (font: string): boolean => {
  const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const testSize = '72px';

  const span = document.createElement('span');
  span.style.fontSize = testSize;
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.innerHTML = testString;
  document.body.appendChild(span);

  const defaultFont = 'monospace';
  span.style.fontFamily = defaultFont;
  const defaultWidth = span.offsetWidth;

  span.style.fontFamily = `${font}, ${defaultFont}`;
  const newWidth = span.offsetWidth;

  document.body.removeChild(span);

  return newWidth !== defaultWidth;
};

export const VZSettings = ({
  enableUsernameField = true,
}: {
  enableUsernameField?: boolean;
}) => {
  // Extracting context values for managing settings state
  const {
    isSettingsOpen,
    closeSettings,
    theme,
    setTheme,
    username,
    setUsername,
  } = useContext(VZCodeContext);

  // Local state for settings that will only be applied when Done is clicked
  const [localFont, setLocalFont] = useState('Roboto Mono');
  const [localFontSize, setLocalFontSize] = useState('16px');
  const [localTheme, setLocalTheme] = useState(theme);
  const [localUsername, setLocalUsername] = useState(username);
  const [availableFonts, setAvailableFonts] = useState<string[]>([]);

  // Initialize local state when modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      // Get current values from localStorage or use defaults
      const storedFont = localStorage.getItem('vzcodeSelectedFont') || 'Roboto Mono';
      const storedFontSize = localStorage.getItem('vzcodeSelectedFontSize') || '16px';
      
      setLocalFont(storedFont);
      setLocalFontSize(storedFontSize);
      setLocalTheme(theme);
      setLocalUsername(username);
    }
  }, [isSettingsOpen, theme, username]);

  // Apply settings when Done button is clicked
  const applySettings = useCallback(() => {
    // Apply font
    document.body.style.setProperty('--vzcode-font-family', localFont);
    localStorage.setItem('vzcodeSelectedFont', localFont);
    
    // Apply font size
    document.body.style.setProperty('--vzcode-font-size', localFontSize);
    localStorage.setItem('vzcodeSelectedFontSize', localFontSize);
    
    // Apply theme
    setTheme(localTheme);
    
    // Apply username
    if (enableUsernameField) {
      setUsername(localUsername);
    }
    
    closeSettings();
  }, [localFont, localFontSize, localTheme, localUsername, closeSettings, setTheme, setUsername, enableUsernameField]);

  // Reset all settings to default values
  const resetSettings = useCallback(() => {
    setLocalFont('Roboto Mono');
    setLocalFontSize('16px');
    setLocalTheme(themes[0].label);
    if (enableUsernameField) {
      setLocalUsername('');
    }
  }, [enableUsernameField]);

  // Close settings modal on Enter key press
  useEffect(() => {
    if (isSettingsOpen) {
      const handleEnterKey = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          applySettings();
        }
      };

      window.addEventListener('keydown', handleEnterKey);
      return () => {
        window.removeEventListener('keydown', handleEnterKey);
      };
    }
  }, [isSettingsOpen, applySettings]);

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
            onChange={(e) =>
              setTheme(e.target.value as ThemeLabel)
            }
          >
            {themes.map(({ label }) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formFork">
          <Form.Label>Font</Form.Label>
          <select
            className="form-select"
            onChange={(e) =>
              setSelectedFont(e.target.value)
            }
            value={selectedFont}
          >
            {availableFonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formFork">
          <Form.Label>Font Size</Form.Label>
          <select
            className="form-select"
            onChange={(e) =>
              setSelectedFontSize(e.target.value)
            }
            value={selectedFontSize}
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={resetSettings}>
          Reset to Default
        </Button>
        <Button variant="primary" onClick={closeSettings}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null;
};
