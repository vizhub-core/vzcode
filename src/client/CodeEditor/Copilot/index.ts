import { inlineCopilot } from 'codemirror-copilot';

const defaultAICopilotEndpoint = '/ai-copilot';

export const copilot = ({
  aiCopilotEndpoint = defaultAICopilotEndpoint,
}: {
  aiCopilotEndpoint: string;
}) => {
  return inlineCopilot(async (prefix, suffix) => {
    const response = await fetch(aiCopilotEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, suffix }),
    });

    const responseJson = await response.json();

    if (responseJson.error) {
      console.error(
        '[copilot] error from server:',
        responseJson.error,
      );
    }

    return responseJson.text;
  });
};
