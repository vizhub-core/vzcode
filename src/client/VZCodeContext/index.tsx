import React, { Context, createContext } from 'react';
import { VZCodeContextValue, VZCodeProviderProps } from './types';
import { useVZCodeState } from './useVZCodeState';

// This context centralizes all the "smart" logic
// to do with the application state. This includes
//  * Accessing and manipulating ShareDB data
//  * Centralized application state
export const VZCodeContext: Context<VZCodeContextValue | null> =
  createContext<VZCodeContextValue>(null);

export const VZCodeProvider: React.FC<VZCodeProviderProps> = ({
  children,
  ...props
}) => {
  // Use the custom hook to get all the context value
  const value = useVZCodeState(props);

  return (
    <VZCodeContext.Provider value={value}>
      {children}
    </VZCodeContext.Provider>
  );
};

// Re-export types for backward compatibility
export type { VZCodeContextValue, VZCodeProviderProps };