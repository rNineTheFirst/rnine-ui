import { createContext, useContext } from 'react';

/** What an AppShell gives the navigation inside it. */
export type AppShellContextValue = {
  /** Closes the navigation where it slides in (narrow screens); does nothing where it's always shown. */
  closeNav: () => void;
};

export const AppShellContext = createContext<AppShellContextValue | null>(null);

/** The AppShell around this component, or null outside one. */
export function useAppShell(): AppShellContextValue | null {
  return useContext(AppShellContext);
}
