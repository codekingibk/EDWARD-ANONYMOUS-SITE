import { apiRequest } from "@/lib/queryClient";
import { User, Message, ChatMessage, Report } from "@shared/schema";

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/login', { username, password });
    return response.json();
  },

  register: async (username: string, email: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/register', { username, email, password });
    return response.json();
  },

  logout: async () => {
    const response = await apiRequest('POST', '/api/auth/logout');
    return response.json();
  },

  // Users
  getUserByUsername: async (username: string) => {
    const response = await apiRequest('GET', `/api/users/${username}`);
    return response.json();
  },

  // Messages
  sendMessage: async (recipientId: number, content: string, senderInfo?: string) => {
    const response = await apiRequest('POST', '/api/messages', {
      recipientId,
      content,
      senderInfo
    });
    return response.json();
  },

  getMessages: async () => {
    const response = await apiRequest('GET', '/api/messages');
    return response.json();
  },

  deleteMessage: async (messageId: number) => {
    const response = await apiRequest('DELETE', `/api/messages/${messageId}`);
    return response.json();
  },

  markMessageAsRead: async (messageId: number) => {
    const response = await apiRequest('PATCH', `/api/messages/${messageId}/read`);
    return response.json();
  },

  // Chat
  getChatMessages: async () => {
    const response = await apiRequest('GET', '/api/chat/messages');
    return response.json();
  },

  // Reports
  createReport: async (messageId?: number, chatMessageId?: number, reason?: string) => {
    const response = await apiRequest('POST', '/api/reports', {
      messageId,
      chatMessageId,
      reason
    });
    return response.json();
  },

  // Admin
  getAdminStats: async () => {
    const response = await apiRequest('GET', '/api/admin/stats');
    return response.json();
  },

  getAllUsers: async () => {
    const response = await apiRequest('GET', '/api/admin/users');
    return response.json();
  },

  getAllReports: async () => {
    const response = await apiRequest('GET', '/api/admin/reports');
    return response.json();
  },

  updateReportStatus: async (reportId: number, status: string) => {
    const response = await apiRequest('PATCH', `/api/admin/reports/${reportId}`, { status });
    return response.json();
  },

  deleteUser: async (userId: number) => {
    const response = await apiRequest('DELETE', `/api/admin/users/${userId}`);
    return response.json();
  },
};
