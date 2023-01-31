import { useState, useEffect } from 'react';
import './App.css';
import ShareDBClient from 'sharedb-client-browser/sharedb-client-json1-browser.js';

const { Connection } = ShareDBClient;
const socket = new WebSocket('ws://' + window.location.host);
const connection = new Connection(socket);

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const doc = connection.get('documents', '1');

    doc.subscribe(() => {
      setData(doc.data);
    });
  }, []);

  return (
    <div className="App">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default App;
