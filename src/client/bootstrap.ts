// A central place where we import what we need from react-bootstrap.
// This strange looking way of importing makes it work with Vite's SSR build.
// Otherwise we get `Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import`
import Form from 'react-bootstrap/cjs/Form.js';
import Button from 'react-bootstrap/cjs/Button.js';
import Modal from 'react-bootstrap/cjs/Modal.js';
import OverlayTrigger from 'react-bootstrap/cjs/OverlayTrigger.js';
import Tooltip from 'react-bootstrap/cjs/Tooltip.js';

// Pull in custom CSS from vizhub-ui.
import 'vizhub-ui/dist/vizhub-ui.css';

export { Form, Button, Modal, OverlayTrigger, Tooltip };
