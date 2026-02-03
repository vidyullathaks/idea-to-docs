import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User stories schema for JSON storage
export const userStorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  acceptanceCriteria: z.array(z.string()),
  priority: z.enum(["high", "medium", "low"]),
});

export type UserStory = z.infer<typeof userStorySchema>;

// PRD documents table
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

// Analytics table for tracking usage
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // 'prd_generated', 'prd_viewed', 'prd_exported'
  prdId: integer("prd_id"),
  ideaLength: integer("idea_length"),
  generationTimeMs: integer("generation_time_ms"),
  exportType: text("export_type"), // 'markdown', 'notion', 'jira'
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

// Keep existing users table for compatibility
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
