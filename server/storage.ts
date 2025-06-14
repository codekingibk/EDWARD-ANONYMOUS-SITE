import { users, messages, chatMessages, reports, siteSettings, type User, type InsertUser, type Message, type InsertMessage, type ChatMessage, type InsertChatMessage, type Report, type InsertReport, type SiteSettings, type InsertSiteSettings } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;

  // Message methods
  createMessage(insertMessage: InsertMessage): Promise<Message>;
  getMessagesByRecipient(recipientId: number): Promise<Message[]>;
  deleteMessage(messageId: number, userId: number): Promise<void>;
  markMessageAsRead(messageId: number, userId: number): Promise<void>;

  // Chat message methods
  createChatMessage(insertChatMessage: InsertChatMessage): Promise<ChatMessage>;
  getRecentChatMessages(limit: number): Promise<ChatMessage[]>;

  // Report methods
  createReport(insertReport: InsertReport): Promise<Report>;
  getAllReports(): Promise<Report[]>;
  updateReportStatus(reportId: number, status: string): Promise<void>;

  // Admin methods
  getAdminStats(): Promise<any>;

  // Site settings methods
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings>;
  getReportsWithDetails(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMessagesByRecipient(recipientId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.recipientId, recipientId))
      .orderBy(desc(messages.createdAt));
  }

  async deleteMessage(messageId: number, userId: number): Promise<void> {
    await db
      .delete(messages)
      .where(eq(messages.id, messageId));
  }

  async markMessageAsRead(messageId: number, userId: number): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  async createChatMessage(insertChatMessage: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db
      .insert(chatMessages)
      .values(insertChatMessage)
      .returning();
    return chatMessage;
  }

  async getRecentChatMessages(limit: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values(insertReport)
      .returning();
    return report;
  }

  async getAllReports(): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .orderBy(desc(reports.createdAt));
  }

  async updateReportStatus(reportId: number, status: string): Promise<void> {
    await db
      .update(reports)
      .set({ status })
      .where(eq(reports.id, reportId));
  }

  async getAdminStats(): Promise<any> {
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalMessages] = await db.select({ count: count() }).from(messages);
    const [totalChatMessages] = await db.select({ count: count() }).from(chatMessages);
    
    return {
      totalUsers: totalUsers.count,
      activeUsers: totalUsers.count, // Simplified for now
      totalMessages: totalMessages.count + totalChatMessages.count,
    };
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    return settings || undefined;
  }

  async updateSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings> {
    // First check if settings exist
    const existing = await this.getSiteSettings();
    
    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(siteSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(siteSettings)
        .values(settings)
        .returning();
      return created;
    }
  }

  async getReportsWithDetails(): Promise<any[]> {
    const reportsWithDetails = await db
      .select({
        id: reports.id,
        reason: reports.reason,
        status: reports.status,
        createdAt: reports.createdAt,
        reporterUsername: users.username,
        reporterEmail: users.email,
        messageContent: messages.content,
        chatMessageContent: chatMessages.content,
      })
      .from(reports)
      .leftJoin(users, eq(reports.reporterId, users.id))
      .leftJoin(messages, eq(reports.messageId, messages.id))
      .leftJoin(chatMessages, eq(reports.chatMessageId, chatMessages.id))
      .orderBy(desc(reports.createdAt));
    
    return reportsWithDetails;
  }
}

export const storage = new DatabaseStorage();