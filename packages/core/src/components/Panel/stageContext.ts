import { createContext, useContext } from 'react';

export type StageContextValue = { enterDelay: number };

/** Shared between PanelStage and the panels inside it. */
export const PanelStageContext = createContext<StageContextValue>({ enterDelay: 0 });

/** How long a panel should wait before starting its own entrance effects (e.g. the title reveal). */
export function usePanelEnterDelay(): number {
  return useContext(PanelStageContext).enterDelay;
}
