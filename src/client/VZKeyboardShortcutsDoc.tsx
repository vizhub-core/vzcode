import React, { useCallback, useContext } from 'react';
import { Button, Modal, Form } from './bootstrap';
import { ThemeLabel, themes } from './themes';
import { VZCodeContext } from './VZCodeContext';

export const VZKeyboardShortcutsDoc = ({
  enableUsernameField = true,
}: {
  enableUsernameField?: boolean;
}) => {
  const {
    isDocOpen,
    closeDoc,
    setTheme,
    setUsername,
  } = useContext(VZCodeContext);

  const handleThemeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setTheme(event.target.value as ThemeLabel);
    },
    [],
  );

  return isDocOpen ? (
    <Modal
      className="vz-settings"
      show={isDocOpen}
      onHide={closeDoc}
      animation={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Keyboard Shortcuts</Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-1">
        <Form.Group className="mb-3">
          <Form.Text className="text-muted">
            Keyboard shortcuts and interactive widgets for
            quick actions
          </Form.Text>
        </Form.Group>

        {/* ────────────────── Windows / Linux ────────────────── */}
        <Form.Group className="mb-4">
          <Form.Label>WINDOWS / LINUX</Form.Label>
          <ul>
            <li>
              <strong>
                <kbd>Ctrl</kbd> + <kbd>S</kbd>
              </strong>{' '}
              or{' '}
              <strong>
                <kbd>Shift↑</kbd> + <kbd>Enter←</kbd>
              </strong>
              <br />
              <span>Run and format code</span>
            </li>
            <li>
              <strong>
                <kbd>Alt</kbd> + Drag&nbsp;number
              </strong>
              <br />
              <span>Scrub number value left / right</span>
            </li>
            <li>
              <strong>
                <kbd>Alt</kbd> + Click&nbsp;color
              </strong>
              <br />
              <span>Open inline color-picker</span>
            </li>

            <li>
              <strong>
                <kbd>Alt</kbd> + <kbd>W</kbd>
              </strong>
              <br />
              <span>Close current tab</span>
            </li>

            <li>
              <strong>
                <kbd>Alt</kbd> + <kbd>N</kbd>
              </strong>{' '}
              |{' '}
              <strong>
                <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd>
              </strong>
              <br />
              <span>Open “New File” modal</span>
            </li>

            <li>
              <strong>
                <kbd>Alt</kbd> + <kbd>PgUp↑</kbd>
              </strong>
              <br />
              <span>Previous tab</span>
            </li>

            <li>
              <strong>
                <kbd>Alt</kbd> + <kbd>PgDn↓</kbd>
              </strong>
              <br />
              <span>Next tab</span>
            </li>

            <li>
              <strong>Most VS Code Shortcuts</strong>
              <br />
              <a
                href="https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
                target="_blank"
              >
                Windows
              </a>
              ,{' '}
              <a
                href="https://code.visualstudio.com/shortcuts/keyboard-shortcuts-linux.pdf"
                target="_blank"
              >
                Linux
              </a>
            </li>
          </ul>
        </Form.Group>

        {/* ────────────────────── macOS ─────────────────────── */}
        <Form.Group>
          <Form.Label>MACOS</Form.Label>
          <ul>
            {/* Tab / file management */}
            <li>
              <strong>
                <kbd>⌘</kbd> + <kbd>W</kbd>
              </strong>
              <br />
              <span>Close current tab</span>
            </li>

            <li>
              <strong>
                <kbd>⌘</kbd> + <kbd>N</kbd>
              </strong>
              <br />
              <span>Open “New File” modal</span>
            </li>

            <li>
              <strong>
                <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>[</kbd>
              </strong>
              <br />
              <span>Previous tab</span>
            </li>

            <li>
              <strong>
                <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>]</kbd>
              </strong>
              <br />
              <span>Next tab</span>
            </li>

            {/* Save / run / format */}
            <li>
              <strong>
                <kbd>⌘</kbd> + <kbd>S</kbd>
              </strong>
              <br />
              <span>Format &amp; run code (save analogue)</span>
            </li>

            <li>
              <strong>
                <kbd>⌘</kbd> + <kbd>P</kbd>
              </strong>
              <br />
              <span>Format with Prettier</span>
            </li>

            <li>
              <strong>
                <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>⏎</kbd>
              </strong>
              <br />
              <span>Format &amp; run code</span>
            </li>

            {/* Side-bar actions */}
            <li>
              <strong>
                <kbd>⌘</kbd> + <kbd>,</kbd>
              </strong>
              <br />
              <span>Open Settings</span>
            </li>

            <li>
              <strong>
                <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>F</kbd>
              </strong>
              <br />
              <span>Focus Search panel</span>
            </li>

            <li>
              <strong>
                <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>E</kbd>
              </strong>
              <br />
              <span>Toggle File Explorer</span>
            </li>

            <li>
              <strong>
                <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>B</kbd>
              </strong>
              <br />
              <span>Open Bug / Console panel</span>
            </li>

            {/* Pane focus */}
            <li>
              <strong>
                <kbd>⌘</kbd> + <kbd>1</kbd>
              </strong>{' '}
              |{' '}
              <strong>
                <kbd>⌘</kbd> + <kbd>2</kbd>
              </strong>
              <br />
              <span>Focus sidebar / editor</span>
            </li>

            <li>
              <strong>VS Code Shortcuts for Mac</strong>
              <br />
              <a
                href="https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf"
                target="_blank"
              >
                Download PDF
              </a>
            </li>
          </ul>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={closeDoc}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null;
};
