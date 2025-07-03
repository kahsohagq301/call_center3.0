import { sqliteTable, text, integer, blob, real } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = sqliteTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: text("expire").notNull(),
});

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").notNull(), // 'super_admin', 'cc_agent', 'cro_agent'
  profileImage: text("profile_image"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Call numbers table
export const callNumbers = sqliteTable("call_numbers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phoneNumber: text("phone_number").notNull(),
  assignedAgentId: integer("assigned_agent_id").references(() => users.id),
  category: text("category"), // 'switched_off', 'busy', 'no_answer', 'not_interested', 'interested'
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  categorizedAt: text("categorized_at"),
});

// Leads table
export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerName: text("customer_name").notNull(),
  customerNumber: text("customer_number").notNull(),
  biodata: text("biodata"), // File path or URL
  description: text("description"),
  agentId: integer("agent_id").references(() => users.id),
  status: text("status").default("active"), // 'active', 'transferred'
  transferredTo: integer("transferred_to").references(() => users.id),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Reports table
export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: integer("agent_id").references(() => users.id),
  onlineCalls: integer("online_calls").notNull(),
  offlineCalls: integer("offline_calls").notNull(),
  totalLeads: integer("total_leads").notNull(),
  reportDate: text("report_date").default(sql`(datetime('now'))`),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Daily tasks table
export const dailyTasks = sqliteTable("daily_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: integer("agent_id").references(() => users.id),
  taskDate: text("task_date").default(sql`(datetime('now'))`),
  leadsAdded: integer("leads_added").default(0),
  leadsTransferred: integer("leads_transferred").default(0),
  reportSubmitted: integer("report_submitted").default(0), // SQLite uses integer for boolean
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
