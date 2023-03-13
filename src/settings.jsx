import React from 'react';

function Settings(props) {
  return (
    <div className="settingsPage">
      <h1>Settings</h1>
      <button
        onClick={() => {
          props.setSettings(false);
        }}
      >
        Close
      </button>
    </div>
  );
}

export default Settings;
