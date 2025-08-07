import { useCallback, useState } from 'react';

// Custom hook to manage runtime error state
export const useRuntimeError = () => {
  // State to hold the runtime error message
  // `null` means no errors
  // If this is a string, it's the
  // error message from runtime execution.
  const [runtimeError, setRuntimeError] = useState<
    string | null
  >(null);

  // Callback function to handle runtime errors
  // This will be passed to the createRuntime function
  const handleRuntimeError = useCallback(
    (formattedErrorMessage: string) => {
      setRuntimeError(formattedErrorMessage);
    },
    [],
  );

  // Function to clear runtime errors
  const clearRuntimeError = useCallback(() => {
    setRuntimeError(null);
  }, []);

  return {
    runtimeError,
    handleRuntimeError,
    clearRuntimeError,
  };
};
