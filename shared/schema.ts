import { pgTable, text, integer, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").notNull(), // 'super_admin', 'cc_agent', 'cro_agent'
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Call numbers table
export const callNumbers = pgTable("call_numbers", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  assignedAgentId: integer("assigned_agent_id").references(() => users.id),
  category: text("category"), // 'switched_off', 'busy', 'no_answer', 'not_interested', 'interested'
  createdAt: timestamp("created_at").defaultNow(),
  categorizedAt: timestamp("categorized_at"),
});

// Leads table
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  profileId: text("profile_id").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerNumber: text("customer_number").notNull(),
  biodata: text("biodata"), // File path or URL
  description: text("description"),
  agentId: integer("agent_id").references(() => users.id),
  status: text("status").default("active"), // 'active', 'transferred'
  transferredTo: integer("transferred_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reports table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => users.id),
  onlineCalls: integer("online_calls").notNull(),
  offlineCalls: integer("offline_calls").notNull(),
  totalLeads: integer("total_leads").notNull(),
  reportDate: timestamp("report_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily tasks table
export const dailyTasks = pgTable("daily_tasks", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => users.id),
  taskDate: timestamp("task_date").defaultNow(),
  leadsAdded: integer("leads_added").default(0),
  leadsTransferred: integer("leads_transferred").default(0),
  reportSubmitted: boolean("report_submitted").default(false), // PostgreSQL uses boolean
});

// Number uploads table
export const numberUploads = pgTable("number_uploads", {
  id: serial("id").primaryKey(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  assignedAgentId: integer("assigned_agent_id").references(() => users.id),
  fileName: text("file_name").notNull(),
  numbersCount: integer("numbers_count").notNull(),
  uploadDate: timestamp("upload_date").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  callNumbers: many(callNumbers),
  leads: many(leads),
  transferredLeads: many(leads, { relationName: "transferredLeads" }),
  reports: many(reports),
  dailyTasks: many(dailyTasks),
}));

export const callNumbersRelations = relations(callNumbers, ({ one }) => ({
  assignedAgent: one(users, {
    fields: [callNumbers.assignedAgentId],
    references: [users.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  agent: one(users, {
    fields: [leads.agentId],
    references: [users.id],
  }),
  transferredToAgent: one(users, {
    fields: [leads.transferredTo],
    references: [users.id],
    relationName: "transferredLeads",
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  agent: one(users, {
    fields: [reports.agentId],
    references: [users.id],
  }),
}));

export const dailyTasksRelations = relations(dailyTasks, ({ one }) => ({
  agent: one(users, {
    fields: [dailyTasks.agentId],
    references: [users.id],
  }),
}));

export const numberUploadsRelations = relations(numberUploads, ({ one }) => ({
  uploader: one(users, {
    fields: [numberUploads.uploadedBy],
    references: [users.id],
  }),
  assignedAgent: one(users, {
    fields: [numberUploads.assignedAgentId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCallNumberSchema = createInsertSchema(callNumbers).omit({
  id: true,
  createdAt: true,
  categorizedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  profileId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  reportDate: true,
  createdAt: true,
});

export const insertDailyTaskSchema = createInsertSchema(dailyTasks).omit({
  id: true,
  taskDate: true,
});

export const insertNumberUploadSchema = createInsertSchema(numberUploads).omit({
  id: true,
  uploadDate: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type CallNumber = typeof callNumbers.$inferSelect;
export type InsertCallNumber = z.infer<typeof insertCallNumberSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type DailyTask = typeof dailyTasks.$inferSelect;
export type InsertDailyTask = z.infer<typeof insertDailyTaskSchema>;
export type NumberUpload = typeof numberUploads.$inferSelect;
export type InsertNumberUpload = z.infer<typeof insertNumberUploadSchema>;
