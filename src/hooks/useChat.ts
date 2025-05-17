import { useEffect, useState, useRef } from "react";

export const useChat = (wsUrl: string) => {
  const [messages, setMessages] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onmessage = (ev) => {
      setMessages((prev) => [...prev, ev.data]);
    };

    return () => socketRef.current?.close();
  }, [wsUrl]);

  const send = (data: any) => socketRef.current?.send(JSON.stringify(data));

  return { messages, send };
};
