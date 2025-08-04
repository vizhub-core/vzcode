// This module deals with storing and accessing the
// AI ghost completions setting in local storage.
import { useEffect, useRef } from 'react';

const localStoragePropertyName = 'vzCodeEnableAIGhostCompletions';

const defaultEnableAIGhostCompletions = false;

// Gets the AI ghost completions setting from local storage.
export const useInitialEnableAIGhostCompletions = (): boolean => {
  let initialValue: boolean = defaultEnableAIGhostCompletions;

  // If we're in the browser,
  if (typeof window !== 'undefined') {
    //check localStorage for a previously stored value.
    const storedValue: string | null =
      window.localStorage.getItem(localStoragePropertyName);

    // If there is a previously stored value,
    if (storedValue !== null) {
      // use it as the initial value.
      initialValue = storedValue === 'true';
    }
  }
  return initialValue;
};

// Stores the AI ghost completions setting to local storage.
export const usePersistEnableAIGhostCompletions = (enableAIGhostCompletions: boolean) => {
  const previousValue = useRef<boolean>(enableAIGhostCompletions);
  useEffect(() => {
    if (previousValue.current !== enableAIGhostCompletions) {
      previousValue.current = enableAIGhostCompletions;
      window.localStorage.setItem(
        localStoragePropertyName,
        enableAIGhostCompletions.toString(),
      );
    }
  }, [enableAIGhostCompletions]);
};