import { createRoot } from 'react-dom';
// This variable is used, but ESLint thinks it is not used
import App from './app';

const root = createRoot(document.getElementById('root'));

const x = y + 1;  // y is not defined — should trigger 'no-undef'
