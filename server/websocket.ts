import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema } from "@shared/schema";

export function setupWebSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  let onlineUsers = new Set<string>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userData) => {
      if (userData?.username) {
        socket.data.user = userData;
        onlineUsers.add(userData.username);
        io.emit("user_count", onlineUsers.size);
      }
    });

    socket.on("chat_message", async (data) => {
      try {
        if (!socket.data.user) {
          socket.emit("error", "Authentication required");
          return;
        }

        const messageData = insertChatMessageSchema.parse({
          userId: socket.data.user.id,
          content: data.content,
        });

        const message = await storage.createChatMessage(messageData);
        
        // Broadcast the message to all connected clients
        io.emit("new_chat_message", {
          id: message.id,
          username: socket.data.user.username,
          content: message.content,
          createdAt: message.createdAt,
          initials: socket.data.user.username.substring(0, 2).toUpperCase(),
        });
      } catch (error) {
        console.error("Chat message error:", error);
        socket.emit("error", "Failed to send message");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      if (socket.data.user?.username) {
        onlineUsers.delete(socket.data.user.username);
        io.emit("user_count", onlineUsers.size);
      }
    });
  });

  return io;
}
