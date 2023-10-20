import './style.scss';

export const PrettierErrorOverlay = ({ prettierError }) => {
  return prettierError !== null ? (
    <pre className="prettier-error-overlay">
      {prettierError}
    </pre>
  ) : null;
};
