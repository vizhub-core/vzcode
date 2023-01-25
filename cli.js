#!/usr/bin/env node
import express from 'express';

console.log('Welcome to VZCode!');

const app = express();
const port = 3030;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Editor is live at http://localhost:${port}`);
});
