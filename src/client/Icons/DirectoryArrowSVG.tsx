export const DirectoryArrowSVG = ({
  height = 16,
  fill = 'currentcolor',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    viewBox={'4 4 16 16'}
  >
    <path
      stroke={fill}
      fill="none"
      d="M8 17l9-5-9-5v10z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);
