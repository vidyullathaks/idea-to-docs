import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
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
