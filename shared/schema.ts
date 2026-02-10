import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userStorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  acceptanceCriteria: z.array(z.string()),
  priority: z.enum(["high", "medium", "low"]),
});

export type UserStory = z.infer<typeof userStorySchema>;

export const prds = pgTable("prds", {
  id: serial("id").primaryKey(),
  title: text("title"),
  rawIdea: text("raw_idea").notNull(),
  problemStatement: text("problem_statement"),
  targetAudience: text("target_audience"),
  goals: text("goals").array(),
  features: text("features").array(),
  successMetrics: text("success_metrics").array(),
  userStories: jsonb("user_stories").$type<UserStory[]>().default([]),
  outOfScope: text("out_of_scope").array(),
  assumptions: text("assumptions").array(),
  status: text("status").notNull().default("draft"),
  shareId: text("share_id").unique(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPrdSchema = createInsertSchema(prds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPrd = z.infer<typeof insertPrdSchema>;
export type Prd = typeof prds.$inferSelect;

export const prdVersions = pgTable("prd_versions", {
  id: serial("id").primaryKey(),
  prdId: integer("prd_id").notNull(),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
  changeSummary: text("change_summary"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPrdVersionSchema = createInsertSchema(prdVersions).omit({
  id: true,
  createdAt: true,
});

export type InsertPrdVersion = z.infer<typeof insertPrdVersionSchema>;
export type PrdVersion = typeof prdVersions.$inferSelect;

export const customTemplates = pgTable("custom_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  idea: text("idea").notNull(),
  category: text("category").default("custom"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertCustomTemplateSchema = createInsertSchema(customTemplates).omit({
  id: true,
  createdAt: true,
});

export type InsertCustomTemplate = z.infer<typeof insertCustomTemplateSchema>;
export type CustomTemplate = typeof customTemplates.$inferSelect;

export const toolResults = pgTable("tool_results", {
  id: serial("id").primaryKey(),
  toolType: text("tool_type").notNull(),
  title: text("title").notNull(),
  rawInput: text("raw_input").notNull(),
  result: jsonb("result").$type<Record<string, unknown>>().notNull(),
  shareId: text("share_id").unique(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertToolResultSchema = createInsertSchema(toolResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertToolResult = z.infer<typeof insertToolResultSchema>;
export type ToolResult = typeof toolResults.$inferSelect;

export const toolResultVersions = pgTable("tool_result_versions", {
  id: serial("id").primaryKey(),
  toolResultId: integer("tool_result_id").notNull(),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
  changeSummary: text("change_summary"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertToolResultVersionSchema = createInsertSchema(toolResultVersions).omit({
  id: true,
  createdAt: true,
});

export type InsertToolResultVersion = z.infer<typeof insertToolResultVersionSchema>;
export type ToolResultVersion = typeof toolResultVersions.$inferSelect;

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  prdId: integer("prd_id"),
  ideaLength: integer("idea_length"),
  generationTimeMs: integer("generation_time_ms"),
  exportType: text("export_type"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
