import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./use-auth";

interface ChatMessage {
  id: number;
  username: string;
  content: string;
  createdAt: string;
  initials: string;
}

export function useWebSocket() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (user && !socketRef.current) {
      socketRef.current = io();

      socketRef.current.on("connect", () => {
        setIsConnected(true);
        socketRef.current?.emit("join", user);
      });

      socketRef.current.on("disconnect", () => {
        setIsConnected(false);
      });

      socketRef.current.on("user_count", (count: number) => {
        setOnlineUsers(count);
      });

      socketRef.current.on("new_chat_message", (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
      });

      socketRef.current.on("error", (error: string) => {
        console.error("WebSocket error:", error);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [user]);

  const sendMessage = (content: string) => {
    if (socketRef.current && content.trim()) {
      socketRef.current.emit("chat_message", { content });
    }
  };

  return {
    isConnected,
    onlineUsers,
    messages,
    sendMessage,
  };
}
