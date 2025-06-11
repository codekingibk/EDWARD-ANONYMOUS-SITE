import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupWebSocket } from "./websocket";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema, insertChatMessageSchema, insertReportSchema, loginSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import { z } from "zod";

const ADMIN_CREDENTIALS = {
  username: 'Adegboyega',
  password: 'ibukun'
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'edwards-anonymous-session-secret-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Allow HTTP for development and cross-browser compatibility
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax', // Better cross-browser compatibility
    },
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session?.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  };

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      req.session.user = userWithoutPassword;

      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);

      // Check for admin credentials
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const adminUser = {
          id: 0,
          username: 'Administrator',
          email: 'admin@edwardsanonymous.com',
          isAdmin: true,
          createdAt: new Date(),
        };
        req.session.user = adminUser;
        return res.json({ user: adminUser });
      }

      // Regular user login
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const { password: _, ...userWithoutPassword } = user;
      req.session.user = userWithoutPassword;

      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.session?.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // User routes
  app.get('/api/users/:username', async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Message routes
  app.post('/api/messages', async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json({ message });
    } catch (error) {
      console.error('Create message error:', error);
      res.status(400).json({ message: 'Failed to create message' });
    }
  });

  app.get('/api/messages', requireAuth, async (req, res) => {
    try {
      const messages = await storage.getMessagesByRecipient(req.session.user.id);
      res.json({ messages });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: 'Failed to get messages' });
    }
  });

  app.delete('/api/messages/:id', requireAuth, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      await storage.deleteMessage(messageId, req.session.user.id);
      res.json({ message: 'Message deleted' });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({ message: 'Failed to delete message' });
    }
  });

  app.patch('/api/messages/:id/read', requireAuth, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      await storage.markMessageAsRead(messageId, req.session.user.id);
      res.json({ message: 'Message marked as read' });
    } catch (error) {
      console.error('Mark message as read error:', error);
      res.status(500).json({ message: 'Failed to mark message as read' });
    }
  });

  // Chat message routes
  app.get('/api/chat/messages', async (req, res) => {
    try {
      const messages = await storage.getRecentChatMessages(50);
      res.json({ messages });
    } catch (error) {
      console.error('Get chat messages error:', error);
      res.status(500).json({ message: 'Failed to get chat messages' });
    }
  });

  // Report routes
  app.post('/api/reports', requireAuth, async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      const report = await storage.createReport({
        ...reportData,
        reporterId: req.session.user.id,
      });
      res.json({ report });
    } catch (error) {
      console.error('Create report error:', error);
      res.status(400).json({ message: 'Failed to create report' });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json({ stats });
    } catch (error) {
      console.error('Get admin stats error:', error);
      res.status(500).json({ message: 'Failed to get admin stats' });
    }
  });

  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ users });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Failed to get users' });
    }
  });

  app.get('/api/admin/reports', requireAdmin, async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json({ reports });
    } catch (error) {
      console.error('Get all reports error:', error);
      res.status(500).json({ message: 'Failed to get reports' });
    }
  });

  app.patch('/api/admin/reports/:id', requireAdmin, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const { status } = req.body;
      await storage.updateReportStatus(reportId, status);
      res.json({ message: 'Report status updated' });
    } catch (error) {
      console.error('Update report status error:', error);
      res.status(500).json({ message: 'Failed to update report status' });
    }
  });

  app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);
      res.json({ message: 'User deleted' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  const httpServer = createServer(app);
  setupWebSocket(httpServer);

  return httpServer;
}
