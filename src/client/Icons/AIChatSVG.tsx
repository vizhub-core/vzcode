export const AIChatSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Chat bubble */}
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />

    {/* AI brain/circuit pattern inside bubble */}
    <circle cx="9" cy="9" r="1" fill="currentColor" />
    <circle cx="15" cy="9" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />

    {/* Neural network connections */}
    <path d="M9 9l3 3" strokeWidth="1" />
    <path d="M15 9l-3 3" strokeWidth="1" />

    {/* AI sparkle accent */}
    <path
      d="M16.5 6.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5z"
      fill="currentColor"
      strokeWidth="0.5"
    />
  </svg>
);
