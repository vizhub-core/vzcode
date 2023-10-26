// This module deals with storing and accessing the

import { useEffect, useRef } from 'react';
import { Username } from '../types';

// Gets the username from local storage.
export const useInitialUsername = () => {
  const localStoragePropertyName = 'vzCodeUsername';

  const initialUsernameDefault = 'Anonymous';
  let initialUsername: Username = initialUsernameDefault;

  // If we're in the browser,
  if (typeof window !== 'undefined') {
    //check localStorage for a previously stored width.
    const initialUsernameFromLocalStorage: string | null =
      window.localStorage.getItem(localStoragePropertyName);

    // If there is a previously stored width,
    if (initialUsernameFromLocalStorage !== null) {
      // use it as the initial width.
      initialUsername = initialUsernameFromLocalStorage;
    }
  } else {
    // If we're not in the browser, use the default initial width.
  }
  return initialUsername;
};

// Stores the username to local storage.
export const usePersistUsername = (username: Username) => {
  const previousUsername = useRef<Username | null>(
    username,
  );
  useEffect(() => {
    if (previousUsername.current !== username) {
      previousUsername.current = username;
      window.localStorage.setItem(
        'vzCodeUsername',
        username,
      );
    }
  }, [username]);
};
