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

// Constants
const fontSizes = ['10px', '12px', '14px', '16px', '18px', '20px', '24px'];
const systemFonts = [
  '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue',
  'Arial', 'sans-serif', 'Courier New', 'Georgia', 'Tahoma', 'Verdana',
  'Times New Roman', 'Trebuchet MS', 'Comic Sans MS',
];

// Utility: Detect if a font is available
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

// Component
export const VZSettings = ({
  enableUsernameField = true,
}: {
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

  const [selectedFont, setSelectedFont] = useState('Roboto Mono');
  const [selectedFontSize, setSelectedFontSize] = useState('16px');
  const [availableFonts, setAvailableFonts] = useState<string[]>([]);

  const usernameRef = useRef<HTMLInputElement>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSelectedFont(localStorage.getItem('vzcodeSelectedFont') || 'Roboto Mono');
      setSelectedFontSize(localStorage.getItem('vzcodeSelectedFontSize') || '16px');
    }
  }, []);

  // Detect available fonts
  useEffect(() => {
    const detectFonts = () => {
      setAvailableFonts(systemFonts.filter(isFontAvailable));
    };
    detectFonts();
  }, []);

  // Apply selected font and font size to document
  useEffect(() => {
    document.body.style.setProperty('--vzcode-font-family', selectedFont);
  }, [selectedFont]);

  useEffect(() => {
    document.body.style.setProperty('--vzcode-font-size', selectedFontSize);
  }, [selectedFontSize]);

  // Event Handlers
  const handleThemeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setTheme(event.target.value as ThemeLabel);
    },
    [setTheme],
  );

  const handleFontChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFont = event.target.value;
    localStorage.setItem('vzcodeSelectedFont', newFont);
    setSelectedFont(newFont);
  }, []);

  const handleFontSizeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = event.target.value;
    localStorage.setItem('vzcodeSelectedFontSize', newSize);
    setSelectedFontSize(newSize);
  }, []);

  const handleUsernameChange = useCallback(() => {
    setUsername(usernameRef.current?.value || '');
  }, [setUsername]);

  useEffect(() => {
    if (isSettingsOpen) {
      const handleEnterKey = (event: KeyboardEvent) => {
        if (event.key === 'Enter') closeSettings();
      };

      window.addEventListener('keydown', handleEnterKey);
      return () => window.removeEventListener('keydown', handleEnterKey);
    }
  }, [isSettingsOpen, closeSettings]);

  // Reusable Form Group
  const renderFormGroup = (label: string, value: string, options: string[], onChange: React.ChangeEventHandler<HTMLSelectElement>) => (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <select className="form-select" value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Form.Group>
  );

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
        {enableUsernameField && (
          <Form.Group className="mb-3" controlId="usernameField">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              ref={usernameRef}
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter username"
            />
          </Form.Group>
        )}

        {renderFormGroup('Theme', theme, themes.map(({ label }) => label), handleThemeChange)}
        {renderFormGroup('Font', selectedFont, availableFonts, handleFontChange)}
        {renderFormGroup('Font Size', selectedFontSize, fontSizes, handleFontSizeChange)}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={closeSettings}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null;
};
