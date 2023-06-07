import { useCallback } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';
import { oneDark } from '@codemirror/theme-one-dark';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import { abcdef } from '@uiw/codemirror-theme-abcdef';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { githubDark } from '@uiw/codemirror-theme-github';
import { material } from '@uiw/codemirror-theme-material';
import { nord } from '@uiw/codemirror-theme-nord';
import { xcodeLight } from '@uiw/codemirror-theme-xcode';

// TODO document where this list came from
// TODO research which themes are available for CodeMirror 6
const themes = [
  { value: abcdef, label: 'abcdef' },
  { value: dracula, label: 'darcula' },
  { value: eclipse, label: 'eclipse' },
  { value: material, label: 'material' },
  { value: nord, label: 'nord' },
  { value: oneDark, label: 'One Dark' },
  { value: okaidia, label: 'okaidia' },
  { value: githubDark, label: 'github' },
  { value: xcodeLight, label: 'xcode' },
];

const saveTimes = [
  { value: 1, label: '1 second' },
  { value: 5, label: '5 seconds' },
  { value: 10, label: '10 seconds' },
  { value: 30, label: '30 seconds' },
];

export const Settings = ({ show, onClose, setTheme, editor }) => {
  const handleChange = useCallback((selectedOption) => {
    setTheme(selectedOption.value);
    editor.dispatch({
      effects: themeSet.reconfigure(selectedOption.value),
    });
  }, []);

  const handleSaveTimeChange = useCallback((selectedOption) => {
    const time = [{ value: selectedOption.value }];
    fetch('/saveTime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(time),
    });
  }, []);

  return show ? (
    <Modal show={show} onHide={onClose} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3" controlId="formFork">
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" placeholder="Enter username" />
          <Form.Text className="text-muted">
            Enter a username to be displayed on your cursor
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formFork">
          <Form.Label>Theme</Form.Label>
          <Select
            classvalue="themes"
            options={themes}
            onChange={handleChange}
          />
          <Form.Text className="text-muted">
            Select a color theme for the editor
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formFork">
          <Form.Label>Auto-Save Time</Form.Label>
          <Select
            classvalue="themes"
            options={saveTimes}
            onChange={handleSaveTimeChange}
          />
          <Form.Text className="text-muted">Select an auto save time</Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null;
};
