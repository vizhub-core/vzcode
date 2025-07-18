import React from 'react';
// This works well as-is
// DO NOT change it to import from 'react-dom/client'
import { createRoot } from 'react-dom';
import App from './app';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
