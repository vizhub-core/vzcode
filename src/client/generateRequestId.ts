export type RequestId = string;

// Generates a random string of digits.
// e.g. "6891835662438279"
export const generateRequestId = (): RequestId =>
  (Math.random() + '').slice(2);
