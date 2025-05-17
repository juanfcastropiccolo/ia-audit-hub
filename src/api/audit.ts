
import api from "./index";
import { AxiosResponse } from "axios";

// Types
export interface StartSessionPayload {
  client_id: string;
  agent_type: "assistant" | "senior" | "supervisor" | "manager" | "team";
  use_supabase?: boolean;
}

export interface SessionResponse {
  session_id: string;
  // Add other response fields here as needed
}

export interface MessageResponse {
  message: string;
  // Add other response fields here as needed
}

export const startSession = async (body: StartSessionPayload): Promise<SessionResponse> => {
  return api.post("/sessions/start", body).then((r: AxiosResponse) => r.data);
};

export const sendMessage = async (
  sessionId: string,
  message: string,
): Promise<MessageResponse> => {
  return api.post(`/sessions/${sessionId}/message`, { message })
            .then((r: AxiosResponse) => r.data);
};
