import React, {
  useCallback,
  useContext,
} from 'react';
import { Button, Modal, Form } from './bootstrap';
import { ThemeLabel, themes } from './themes';
import { VZCodeContext } from './VZCodeContext';


export const  VZKeyboardShortcutsDoc = ({
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
        <Modal.Title>Keyboard shortcuts</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <Form.Group>
  <Form.Label>WINDOWS</Form.Label>
  <ul>
    <li>
      <strong>Alt + W</strong> <br />
      <span>Close the current tab</span>
    </li>
    <li>
      <strong>Alt + N</strong> <br />
      <span>Open the create file modal</span>
    </li>
    <li>
      <strong>Alt + Page Up</strong> <br />
      <span>Change the active tab to the previous one</span>
    </li>
    <li>
      <strong>Alt + Page Down</strong> <br />
      <span>Change the active tab to the next one</span>
    </li>
    <li>
      <strong>Ctrl + S</strong> or <strong>Shift + Enter</strong> <br />
      <span>Run the code and format it with Prettier</span>
    </li>
  </ul>
  <Form.Text className="text-muted">Keyboard shortcuts for quick actions</Form.Text>
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
