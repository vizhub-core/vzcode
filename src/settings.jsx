import Select from "react-select";

function Settings(props) {

  const themes = [
    { value: 'default', label: 'default' },
    { value: 'default', label: 'default' },
    { value: '3024-day', label: '3024-day' },
    { value: '3024-night', label: '3024-night' },
    { value: 'abbott', label: 'abbott' },
    { value: 'abcdef', label: 'abcdef' },
    { value: 'ambiance', label: 'ambiance' },
    { value: 'ayu-dark', label: 'ayu-dark' },
    { value: 'ayu-mirage', label: 'ayu-mirage' },
    { value: 'base16-dark', label: 'base16-dark' },
    { value: 'base16-light', label: 'base16-light' },
    { value: 'bespin', label: 'bespin' },
    { value: 'blackboard', label: 'blackboard' },
    { value: 'cobalt', label: 'cobalt' },
    { value: 'colorforth', label: 'colorforth' },
    { value: 'darcula', label: 'darcula' },
    { value: 'duotone-dark', label: 'duotone-dark' },
    { value: 'duotone-light', label: 'duotone-light' },
    { value: 'eclipse', label: 'eclipse' },
    { value: 'elegant', label: 'elegant' },
    { value: 'erlang-dark', label: 'erlang-dark' },
    { value: 'gruvbox-dark', label: 'gruvbox-dark' },
    { value: 'hopscotch', label: 'hopscotch' },
    { value: 'icecoder', label: 'icecoder' },
    { value: 'idea', label: 'idea' },
    { value: 'isotope', label: 'isotope' },
    { value: 'juejin', label: 'juejin' },
    { value: 'lesser-dark', label: 'lesser-dark' },
    { value: 'liquibyte', label: 'liquibyte' },
    { value: 'lucario', label: 'lucario' },
    { value: 'material', label: 'material' },
    { value: 'material-darker', label: 'material-darker' },
    { value: 'material-palenight', label: 'material-palenight' },
    { value: 'material-ocean', label: 'material-ocean' },
    { value: 'mbo', label: 'mbo' },
    { value: 'mdn-like', label: 'mdn-like' },
    { value: 'midnight', label: 'midnight' },
    { value: 'monokai', label: 'monokai' },
    { value: 'moxer', label: 'moxer' },
    { value: 'neat', label: 'neat' },
    { value: 'neo', label: 'neo' },
    { value: 'night', label: 'night' },
    { value: 'nord', label: 'nord' },
    { value: 'oceanic-next', label: 'oceanic-next' },
    { value: 'OneDark', label: 'One Dark' },
    { value: 'panda-syntax', label: 'panda-syntax' },
    { value: 'paraiso-dark', label: 'paraiso-dark' },
    { value: 'paraiso-light', label: 'paraiso-light' },
    { value: 'pastel-on-dark', label: 'pastel-on-dark' },
    { value: 'railscasts', label: 'railscasts' },
    { value: 'rubyblue', label: 'rubyblue' },
    { value: 'seti', label: 'seti' },
    { value: 'shadowfox', label: 'shadowfox' },
    { value: 'solarized', label: 'solarized' },
    { value: 'ssms', label: 'ssms' },
    { value: 'the-matrix', label: 'the-matrix' },
    { value: 'tomorrow-night-bright', label: 'tomorrow-night-bright' },
    { value: 'tomorrow-night-eighties', label: 'tomorrow-night-eighties' },
    { value: 'ttcn', label: 'ttcn' },
    { value: 'twilight', label: 'twilight' },
    { value: 'vibrant-ink', label: 'vibrant-ink' },
    { value: 'xq-dark', label: 'xq-dark' },
    { value: 'xq-light', label: 'xq-light' },
    { value: 'yeti', label: 'yeti' },
    { value: 'yonce', label: 'yonce' },
    { value: 'zenburn', label: 'zenburn' },
  ];

  const handleChange = (selectedOption) => {
    props.setTheme(selectedOption.label);
    console.log(`Option selected:`, selectedOption.label);
  };

  return (
    <div classvalue="settingsPage">
      <h1>Settings</h1>
      <button
        onClick={() => {
          props.setSettings(false);
        }}
      >
        Close
      </button>
      <p>Select a theme:
        <Select classvalue="themes" options={themes} onChange={handleChange} />
      </p>
    </div>
  );
}

export default Settings;
