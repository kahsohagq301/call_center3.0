import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertLeadSchema, insertReportSchema, insertCallNumberSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";

// Extend session interface
declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: string;
  }
}

interface AuthenticatedRequest extends Request {
  session: session.Session & Partial<session.SessionData> & {
    userId: number;
    userRole: string;
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = 'uploads/biodata';
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: storage_multer,
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf' || 
          file.mimetype === 'application/msword' || 
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and Word documents are allowed!'));
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });

  // Session configuration using PostgreSQL store
  const pgSession = ConnectPgSimple(session);
  app.use(session({
    store: new pgSession({
      pool: pool,
      tableName: 'sessions',
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  }));

  // Middleware to check authentication
  const requireAuth = (req: AuthenticatedRequest, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      req.session.userRole = user.role;

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Password reset
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { code, email, newPassword } = req.body;
      
      if (code !== "sohagq301") {
        return res.status(400).json({ message: "Invalid reset code" });
      }

      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(user.id, { password: hashedPassword });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Password reset failed" });
    }
  });

  // Call numbers routes
  app.get("/api/calls", requireAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
      const calls = await storage.getCallNumbersByAgent(req.session.userId);
      res.json(calls);
    } catch (error) {
      console.error("Get calls error:", error);
      res.status(500).json({ message: "Failed to get calls" });
    }
  });

  app.post("/api/calls/:id/category", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { category } = req.body;
      
      const call = await storage.updateCallNumberCategory(parseInt(id), category);
      res.json(call);
    } catch (error) {
      console.error("Update call category error:", error);
      res.status(500).json({ message: "Failed to update call category" });
    }
  });

  // Number upload routes
  app.post("/api/admin/upload-numbers", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { assignedAgentId, phoneNumbers, fileName } = req.body;
      
      if (!assignedAgentId || !phoneNumbers || !Array.isArray(phoneNumbers)) {
        return res.status(400).json({ message: "Invalid upload data" });
      }

      // Create number upload record
      const upload = await storage.createNumberUpload({
        uploadedBy: req.session.userId,
        assignedAgentId: parseInt(assignedAgentId),
        fileName: fileName || 'numbers.xlsx',
        numbersCount: phoneNumbers.length,
      });

      // Insert phone numbers
      const callNumbers = phoneNumbers.map(phoneNumber => ({
        phoneNumber: phoneNumber.toString(),
        assignedAgentId: parseInt(assignedAgentId),
      }));

      await storage.uploadCallNumbers(callNumbers);

      res.json({
        message: "Numbers uploaded successfully",
        upload,
        numbersUploaded: phoneNumbers.length,
      });
    } catch (error) {
      console.error("Upload numbers error:", error);
      res.status(500).json({ message: "Failed to upload numbers" });
    }
  });

  app.get("/api/admin/number-uploads", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const uploads = await storage.getNumberUploads();
      res.json(uploads);
    } catch (error) {
      console.error("Get number uploads error:", error);
      res.status(500).json({ message: "Failed to get number uploads" });
    }
  });

  // Super admin route to upload numbers
  app.post("/api/admin/upload-numbers", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { numbers, agentId } = req.body;
      const callNumbers = numbers.map((phoneNumber: string) => ({
        phoneNumber,
        assignedAgentId: agentId,
      }));

      const result = await storage.uploadCallNumbers(callNumbers);
      res.json(result);
    } catch (error) {
      console.error("Upload numbers error:", error);
      res.status(500).json({ message: "Failed to upload numbers" });
    }
  });

  // Leads routes
  app.get("/api/leads", requireAuth, async (req: any, res) => {
    try {
      const leads = await storage.getLeadsByAgent(req.session.userId);
      res.json(leads);
    } catch (error) {
      console.error("Get leads error:", error);
      res.status(500).json({ message: "Failed to get leads" });
    }
  });

  app.get("/api/leads/transferred", requireAuth, async (req: any, res) => {
    try {
      const leads = await storage.getTransferredLeads(req.session.userId);
      res.json(leads);
    } catch (error) {
      console.error("Get transferred leads error:", error);
      res.status(500).json({ message: "Failed to get transferred leads" });
    }
  });

  // File upload endpoint for biodata
  app.post("/api/upload/biodata", requireAuth, upload.single('biodata'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const filePath = `/uploads/biodata/${req.file.filename}`;
      res.json({ filePath });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Serve uploaded files
  app.get("/uploads/:folder/:filename", (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', folder, filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  app.post("/api/leads", requireAuth, async (req: any, res) => {
    try {
      const leadData = insertLeadSchema.parse({
        ...req.body,
        agentId: req.session.userId,
      });
      
      const lead = await storage.createLead(leadData);
      
      // Update daily task
      await storage.updateDailyTask(req.session.userId, {
        leadsAdded: (await storage.getDailyTask(req.session.userId, new Date()))?.leadsAdded || 0 + 1
      });

      res.json(lead);
    } catch (error) {
      console.error("Create lead error:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.put("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const leadData = req.body;
      
      const lead = await storage.updateLead(parseInt(id), leadData);
      res.json(lead);
    } catch (error) {
      console.error("Update lead error:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.post("/api/leads/:id/transfer", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { transferredTo } = req.body;
      
      const lead = await storage.transferLead(parseInt(id), transferredTo);
      
      // Update daily task
      await storage.updateDailyTask(req.session.userId, {
        leadsTransferred: (await storage.getDailyTask(req.session.userId, new Date()))?.leadsTransferred || 0 + 1
      });

      res.json(lead);
    } catch (error) {
      console.error("Transfer lead error:", error);
      res.status(500).json({ message: "Failed to transfer lead" });
    }
  });

  // Reports routes
  app.get("/api/reports", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role === "super_admin") {
        const reports = await storage.getAllReports();
        res.json(reports);
      } else {
        const reports = await storage.getReportsByAgent(req.session.userId);
        res.json(reports);
      }
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({ message: "Failed to get reports" });
    }
  });

  app.post("/api/reports", requireAuth, async (req: any, res) => {
    try {
      const reportData = insertReportSchema.parse({
        ...req.body,
        agentId: req.session.userId,
      });
      
      const report = await storage.createReport(reportData);
      
      // Update daily task
      await storage.updateDailyTask(req.session.userId, {
        reportSubmitted: true
      });

      res.json(report);
    } catch (error) {
      console.error("Create report error:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Daily tasks route
  app.get("/api/daily-tasks", requireAuth, async (req: any, res) => {
    try {
      const task = await storage.getDailyTask(req.session.userId, new Date());
      res.json(task || {
        leadsAdded: 0,
        leadsTransferred: 0,
        reportSubmitted: false
      });
    } catch (error) {
      console.error("Get daily tasks error:", error);
      res.status(500).json({ message: "Failed to get daily tasks" });
    }
  });

  // Stats route
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Route for CC agents to get CRO agents for transfer
  app.get("/api/cro-agents", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== "cc_agent") {
        return res.status(403).json({ message: "Access denied" });
      }

      const users = await storage.getAllUsers();
      const croAgents = users.filter(u => u.role === "cro_agent");
      res.json(croAgents.map(agent => ({
        id: agent.id,
        email: agent.email,
        name: agent.name,
        role: agent.role,
      })));
    } catch (error) {
      console.error("Get CRO agents error:", error);
      res.status(500).json({ message: "Failed to get CRO agents" });
    }
  });

  app.get("/api/admin/leads", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const leads = await storage.getAllLeads();
      res.json(leads);
    } catch (error) {
      console.error("Get all leads error:", error);
      res.status(500).json({ message: "Failed to get leads" });
    }
  });

  // Admin routes for user management
  const requireSuperAdmin = (req: AuthenticatedRequest, res: any, next: any) => {
    if (req.session?.userRole !== 'super_admin') {
      return res.status(403).json({ message: "Access denied. Super admin required." });
    }
    next();
  };

  // Get all users (Super Admin only)
  app.get("/api/admin/users", requireAuth, requireSuperAdmin, async (req: AuthenticatedRequest, res: any) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      })));
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  // Create new user (Super Admin only)
  app.post("/api/admin/users", requireAuth, requireSuperAdmin, async (req: AuthenticatedRequest, res: any) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data", errors: result.error.errors });
      }

      const { name, email, password, role, phone, profileImage } = result.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        profileImage,
      });

      res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone,
        profileImage: newUser.profileImage,
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user (Super Admin only)
  app.put("/api/admin/users/:id", requireAuth, requireSuperAdmin, async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = parseInt(req.params.id);
      const { name, email, role, phone, profileImage, password } = req.body;

      const updateData: any = {
        name,
        email,
        role,
        phone,
        profileImage,
      };

      // Only update password if provided
      if (password && password.length > 0) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await storage.updateUser(userId, updateData);
      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user (Super Admin only)
  app.delete("/api/admin/users/:id", requireAuth, requireSuperAdmin, async (req: AuthenticatedRequest, res: any) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent deleting self
      if (userId === req.session.userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      // Delete the user
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // User profile update
  app.put("/api/profile", requireAuth, async (req: any, res) => {
    try {
      const { password, ...updateData } = req.body;
      
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const user = await storage.updateUser(req.session.userId, updateData);
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
