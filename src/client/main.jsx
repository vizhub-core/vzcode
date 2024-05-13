import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
//import App from './App';
import AppShell from './AppShell';
import { BrowserRouter } from 'react-router-dom'; 

//force re-create shared server !?
//reloadDocThen();
console.log('ReactDOM.createRoot->')
ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <BrowserRouter>
    <AppShell />
    {/* <App /> */}
  </BrowserRouter>,
  // </React.StrictMode>,
);
