import { inlineCopilot } from 'codemirror-copilot';

const defaultAICopilotEndpoint = '/ai-copilot';

const DEBUG = false;

// If the endpoint is broken, we don't want to keep sending requests
// to it. This flag will be set to true if we get an error from the
// server.
let isEndpointBroken = false;

export const copilot = ({
  aiCopilotEndpoint = defaultAICopilotEndpoint,
}: {
  aiCopilotEndpoint: string;
}) => {
  return inlineCopilot(async (prefix, suffix) => {
    DEBUG &&
      console.log('[copilot] Executing AI completion...');
    if (isEndpointBroken) {
      DEBUG &&
        console.log(
          '[copilot] Endpoint is broken, not sending request',
        );
      return '';
    }

    DEBUG &&
      console.log('[copilot] Sending request to server...');
    const response = await fetch(aiCopilotEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, suffix }),
    });

    if (!response.ok) {
      DEBUG &&
        console.error(
          '[copilot] Error from server:',
          response.statusText,
        );
      DEBUG &&
        console.error(
          '[copilot] Disabling future requests to the server',
        );
      isEndpointBroken = true;
      return '';
    }

    const responseJson = await response.json();

    DEBUG &&
      console.log(
        '[copilot] Response from server:',
        response,
      );

    if (responseJson.error) {
      DEBUG &&
        console.error(
          '[copilot] error from server:',
          responseJson.error,
        );
      DEBUG &&
        console.error(
          '[copilot] Disabling future requests to the server',
        );
      isEndpointBroken = true;
      return '';
    }

    return responseJson.text;
  });
};
