import { useContext } from 'react';
import { Button, Modal, Form } from './bootstrap';
import { VZCodeContext } from './VZCodeContext';
import './VZKeyboardShortcutsDoc.scss';

export const VZKeyboardShortcutsDoc = () => {
  const {
    isDocOpen,
    closeDoc,
  } = useContext(VZCodeContext);

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
          <div className="keyboard-shortcuts-list">
            <div className="shortcut-section">
              <h6>File Operations</h6>
              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Ctrl</kbd> + <kbd>S</kbd>
                  <span className="or-text">or</span>
                  <kbd>Shift</kbd> + <kbd>Enter</kbd>
                </div>
                <div className="shortcut-description">
                  Save file
                </div>
              </div>
            </div>
            <div className="shortcut-section">
              <h6>Code Execution</h6>
              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>F5</kbd>, <kbd>Ctrl</kbd> + <kbd>Enter</kbd>, or <kbd>Shift</kbd> + <kbd>Enter</kbd>
                </div>
                <div className="shortcut-description">
                  Run and format code
                </div>
              </div>
            </div>

            <div className="shortcut-section">
              <h6>Interactive Editing</h6>
              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + Drag on a number
                </div>
                <div className="shortcut-description">
                  Modify the number by dragging left or right
                </div>
              </div>

              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + Click on a hex color
                </div>
                <div className="shortcut-description">
                  Open a color picker to modify the color
                </div>
              </div>
            </div>

            <div className="shortcut-section">
              <h6>Tab Management</h6>
              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + <kbd>W</kbd>
                </div>
                <div className="shortcut-description">
                  Close the current tab
                </div>
              </div>

              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + <kbd>N</kbd>
                  <span className="or-text">or</span>
                  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd>
                </div>
                <div className="shortcut-description">
                  Open the create file modal
                </div>
              </div>

              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + <kbd>PageUp</kbd>
                </div>
                <div className="shortcut-description">
                  Change the active tab to the previous one
                </div>
              </div>

              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + <kbd>PageDown</kbd>
                </div>
                <div className="shortcut-description">
                  Change the active tab to the next one
                </div>
              </div>
            </div>

            <div className="shortcut-section">
              <h6>VSCode Shortcuts</h6>
              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <strong>Most VSCode Shortcuts</strong>
                </div>
                <div className="shortcut-description">
                  See VSCode docs:{' '}
                  <a
                    href="https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Windows
                  </a>
                  ,{' '}
                  <a
                    href="https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    MacOS
                  </a>
                  ,{' '}
                  <a
                    href="https://code.visualstudio.com/shortcuts/keyboard-shortcuts-linux.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Linux
                  </a>
                </div>
              </div>
            </div>

            <div className="shortcut-section">
              <h6>Sidebar Navigation</h6>
              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd>
                </div>
                <div className="shortcut-description">
                  Toggle file explorer
                </div>
              </div>

              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd>
                </div>
                <div className="shortcut-description">
                  Toggle search panel
                </div>
              </div>

              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>K</kbd>
                </div>
                <div className="shortcut-description">
                  Show keyboard shortcuts
                </div>
              </div>

              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>
                </div>
                <div className="shortcut-description">
                  Toggle debug panel
                </div>
              </div>

              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Ctrl</kbd> + <kbd>,</kbd> or <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd>
                </div>
                <div className="shortcut-description">
                  Open settings
                </div>
              </div>
            </div>

            <div className="shortcut-section">
              <h6>Focus Management</h6>
              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + <kbd>1</kbd>
                </div>
                <div className="shortcut-description">
                  Focus sidebar
                </div>
              </div>

              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + <kbd>2</kbd>
                </div>
                <div className="shortcut-description">
                  Focus code editor
                </div>
              </div>
            </div>

            <div className="shortcut-section">
              <h6>Additional Features</h6>
              <div className="shortcut-item">
                <div className="shortcut-keys">
                  <kbd>Ctrl</kbd> + Click
                </div>
                <div className="shortcut-description">
                  Jump to definition (when available)
                </div>
              </div>
            </div>
          </div>
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