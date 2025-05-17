import { createContext, useContext } from "react";

interface SessionCtx {
  clientId: string;
  sessionId: string;
}
export const SessionContext = createContext<SessionCtx | null>(null);
export const useSession = () => useContext(SessionContext)!;
