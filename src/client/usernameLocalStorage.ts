// This module deals with storing and accessing the
// username in local storage.
import { useEffect, useRef } from 'react';
import { Username } from '../types';

const localStoragePropertyName = 'vzCodeUsername';

const initialUsernameDefault = 'Anonymous';

// Gets the username from local storage.
export const useInitialUsername = (): Username => {
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
  const previousUsername = useRef<Username>(username);
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
