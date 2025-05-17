import api from "./index";

// Types
export interface StartSessionPayload {
  client_id: string;
  agent_type: "assistant" | "senior" | "supervisor" | "manager" | "team";
  use_supabase?: boolean;
}

export const startSession = async (body: StartSessionPayload) => {
  return api.post("/sessions/start", body).then(r => r.data);
};

export const sendMessage = async (
  sessionId: string,
  message: string,
) => {
  return api.post(`/sessions/${sessionId}/message`, { message })
            .then(r => r.data);
};
