import {
  users,
  callNumbers,
  leads,
  reports,
  dailyTasks,
  numberUploads,
  type User,
  type InsertUser,
  type CallNumber,
  type InsertCallNumber,
  type Lead,
  type InsertLead,
  type Report,
  type InsertReport,
  type DailyTask,
  type InsertDailyTask,
  type NumberUpload,
  type InsertNumberUpload,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // Call number operations
  getCallNumbersByAgent(agentId: number): Promise<CallNumber[]>;
  createCallNumber(callNumber: InsertCallNumber): Promise<CallNumber>;
  updateCallNumberCategory(id: number, category: string): Promise<CallNumber>;
  uploadCallNumbers(numbers: InsertCallNumber[]): Promise<CallNumber[]>;

  // Lead operations
  getLeadsByAgent(agentId: number): Promise<Lead[]>;
  getTransferredLeads(agentId: number): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead>;
  transferLead(id: number, transferredTo: number): Promise<Lead>;
  getAllLeads(): Promise<Lead[]>;

  // Report operations
  getReportsByAgent(agentId: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  getAllReports(): Promise<Report[]>;

  // Daily task operations
  getDailyTask(agentId: number, date: Date): Promise<DailyTask | undefined>;
  updateDailyTask(agentId: number, task: Partial<InsertDailyTask>): Promise<DailyTask>;

  // Number upload operations
  createNumberUpload(upload: InsertNumberUpload): Promise<NumberUpload>;
  getNumberUploads(): Promise<NumberUpload[]>;
  getNumberUploadsByAgent(agentId: number): Promise<NumberUpload[]>;

  // Analytics
  getStats(): Promise<{
    totalCalls: number;
    totalLeads: number;
    totalUsers: number;
    transferredLeads: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getCallNumbersByAgent(agentId: number): Promise<CallNumber[]> {
    return await db
      .select()
      .from(callNumbers)
      .where(eq(callNumbers.assignedAgentId, agentId))
      .orderBy(sql`CASE WHEN category IS NULL THEN 0 ELSE 1 END, created_at DESC`);
  }

  async createCallNumber(callNumber: InsertCallNumber): Promise<CallNumber> {
    const [number] = await db.insert(callNumbers).values(callNumber).returning();
    return number;
  }

  async updateCallNumberCategory(id: number, category: string): Promise<CallNumber> {
    const [number] = await db
      .update(callNumbers)
      .set({ category, categorizedAt: sql`now()` })
      .where(eq(callNumbers.id, id))
      .returning();
    return number;
  }

  async uploadCallNumbers(numbers: InsertCallNumber[]): Promise<CallNumber[]> {
    return await db.insert(callNumbers).values(numbers).returning();
  }

  async getLeadsByAgent(agentId: number): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.agentId, agentId))
      .orderBy(desc(leads.createdAt));
  }

  async getTransferredLeads(agentId: number): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.transferredTo, agentId))
      .orderBy(desc(leads.updatedAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async updateLead(id: number, updateData: Partial<InsertLead>): Promise<Lead> {
    const [lead] = await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async transferLead(id: number, transferredTo: number): Promise<Lead> {
    const [lead] = await db
      .update(leads)
      .set({ 
        transferredTo,
        status: "transferred"
      })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async getAllLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getReportsByAgent(agentId: number): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.agentId, agentId))
      .orderBy(desc(reports.reportDate));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async getAllReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.reportDate));
  }

  async getDailyTask(agentId: number, date: Date): Promise<DailyTask | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [task] = await db
      .select()
      .from(dailyTasks)
      .where(
        and(
          eq(dailyTasks.agentId, agentId),
          sql`${dailyTasks.taskDate} >= ${startOfDay.toISOString()}`,
          sql`${dailyTasks.taskDate} <= ${endOfDay.toISOString()}`
        )
      );
    return task;
  }

  async updateDailyTask(agentId: number, taskData: Partial<InsertDailyTask>): Promise<DailyTask> {
    const today = new Date();
    const existingTask = await this.getDailyTask(agentId, today);
    
    if (existingTask) {
      const [task] = await db
        .update(dailyTasks)
        .set(taskData)
        .where(eq(dailyTasks.id, existingTask.id))
        .returning();
      return task;
    } else {
      const [task] = await db
        .insert(dailyTasks)
        .values({ agentId, ...taskData })
        .returning();
      return task;
    }
  }

  async getStats(): Promise<{
    totalCalls: number;
    totalLeads: number;
    totalUsers: number;
    transferredLeads: number;
  }> {
    // Optimize by using parallel queries
    const [callsResult, leadsResult, usersResult, transferredResult] = await Promise.all([
      db.select({ count: count() }).from(callNumbers),
      db.select({ count: count() }).from(leads),
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(leads).where(eq(leads.status, "transferred"))
    ]);

    return {
      totalCalls: callsResult[0].count,
      totalLeads: leadsResult[0].count,
      totalUsers: usersResult[0].count,
      transferredLeads: transferredResult[0].count,
    };
  }

  async createNumberUpload(upload: InsertNumberUpload): Promise<NumberUpload> {
    const [numberUpload] = await db.insert(numberUploads).values(upload).returning();
    return numberUpload;
  }

  async getNumberUploads(): Promise<NumberUpload[]> {
    return await db.select().from(numberUploads).orderBy(desc(numberUploads.uploadDate));
  }

  async getNumberUploadsByAgent(agentId: number): Promise<NumberUpload[]> {
    return await db.select().from(numberUploads)
      .where(eq(numberUploads.assignedAgentId, agentId))
      .orderBy(desc(numberUploads.uploadDate));
  }
}

export const storage = new DatabaseStorage();
