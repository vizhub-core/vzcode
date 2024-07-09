import React, { useCallback, useContext } from 'react';
import { Button, Modal, Form } from './bootstrap';
import { ThemeLabel, themes } from './themes';
import { VZCodeContext } from './VZCodeContext';

export const VZKeyboardShortcutsDoc = ({
  enableUsernameField = true,
}: {
  // Feature flag to enable/disable username field
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
        <Form.Group>
          {/* <Form.Label>WINDOWS</Form.Label> */}
          <ul>
            <li>
              <strong>Ctrl + s</strong> or{' '}
              <strong>Shift + Enter</strong> <br />
              <span>Run and format code</span>
            </li>
            <li>
              <strong>Alt + drag on a number</strong>
              <br />
              <span>
                Modify the number by dragging left or right
              </span>
            </li>
            <li>
              <strong>Alt + click on a hex color</strong>
              <br />
              <span>
                Open a color picker to modify the color
              </span>
            </li>
            <li>
              <strong>Alt + w</strong> <br />
              <span>Close the current tab</span>
            </li>
            <li>
              <strong>Alt + n</strong> <br />
              <span>Open the create file modal</span>
            </li>
            <li>
              <strong>Alt + Page Up</strong> <br />
              <span>
                Change the active tab to the previous one
              </span>
            </li>
            <li>
              <strong>Alt + Page Down</strong> <br />
              <span>
                Change the active tab to the next one
              </span>
            </li>
            <li>
              <strong>Alt-1</strong> <br/>
              <span>
                Set focus to the sidebar
              </span>
            </li>
            <li>
              <strong>Alt-2</strong> <br/>
              <span>
                Set focus to the code-editor
              </span>
            </li>
            <li>
              <strong>Most VSCode Shortcuts</strong> <br />
              See VSCode docs:{' '}
              <a
                href="https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
                target="_blank"
              >
                Windows
              </a>
              ,{' '}
              <a
                href="https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf"
                target="_blank"
              >
                MacOS
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={closeDoc}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null;
};
