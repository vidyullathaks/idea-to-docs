import { db } from "./db";
import {
  prds,
  analytics,
  prdVersions,
  customTemplates,
  toolResults,
  toolResultVersions,
  type Prd,
  type InsertPrd,
  type InsertAnalytics,
  type Analytics,
  type PrdVersion,
  type InsertPrdVersion,
  type CustomTemplate,
  type InsertCustomTemplate,
  type ToolResult,
  type InsertToolResult,
  type ToolResultVersion,
  type InsertToolResultVersion,
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  getAllPrds(): Promise<Prd[]>;
  getPrd(id: number): Promise<Prd | undefined>;
  getPrdByShareId(shareId: string): Promise<Prd | undefined>;
  createPrd(data: InsertPrd): Promise<Prd>;
  updatePrd(id: number, data: Partial<InsertPrd>): Promise<Prd | undefined>;
  deletePrd(id: number): Promise<void>;
  generateShareId(id: number): Promise<string>;
  createVersion(data: InsertPrdVersion): Promise<PrdVersion>;
  getVersionsByPrdId(prdId: number): Promise<PrdVersion[]>;
  getAllTemplates(): Promise<CustomTemplate[]>;
  createTemplate(data: InsertCustomTemplate): Promise<CustomTemplate>;
  deleteTemplate(id: number): Promise<void>;
  logAnalytics(data: InsertAnalytics): Promise<Analytics>;
  getAnalyticsSummary(): Promise<{ totalPrds: number; totalGenerations: number; avgGenerationTime: number }>;
  getAllToolResults(toolType?: string): Promise<ToolResult[]>;
  getToolResult(id: number): Promise<ToolResult | undefined>;
  getToolResultByShareId(shareId: string): Promise<ToolResult | undefined>;
  createToolResult(data: InsertToolResult): Promise<ToolResult>;
  updateToolResult(id: number, data: Partial<InsertToolResult>): Promise<ToolResult | undefined>;
  deleteToolResult(id: number): Promise<void>;
  generateToolResultShareId(id: number): Promise<string>;
  createToolResultVersion(data: InsertToolResultVersion): Promise<ToolResultVersion>;
  getToolResultVersions(toolResultId: number): Promise<ToolResultVersion[]>;
}

export class PrdStorage implements IStorage {
  async getAllPrds(): Promise<Prd[]> {
    return db.select().from(prds).orderBy(desc(prds.createdAt));
  }

  async getPrd(id: number): Promise<Prd | undefined> {
    const [prd] = await db.select().from(prds).where(eq(prds.id, id));
    return prd;
  }

  async getPrdByShareId(shareId: string): Promise<Prd | undefined> {
    const [prd] = await db.select().from(prds).where(eq(prds.shareId, shareId));
    return prd;
  }

  async createPrd(data: InsertPrd): Promise<Prd> {
    const [prd] = await db.insert(prds).values(data).returning();
    return prd;
  }

  async updatePrd(id: number, data: Partial<InsertPrd>): Promise<Prd | undefined> {
    const [prd] = await db
      .update(prds)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(prds.id, id))
      .returning();
    return prd;
  }

  async deletePrd(id: number): Promise<void> {
    await db.delete(prdVersions).where(eq(prdVersions.prdId, id));
    await db.delete(prds).where(eq(prds.id, id));
  }

  async generateShareId(id: number): Promise<string> {
    const prd = await this.getPrd(id);
    if (!prd) throw new Error("PRD not found");
    if (prd.shareId) return prd.shareId;

    const shareId = crypto.randomBytes(8).toString("hex");
    await db.update(prds).set({ shareId }).where(eq(prds.id, id));
    return shareId;
  }

  async createVersion(data: InsertPrdVersion): Promise<PrdVersion> {
    const [version] = await db.insert(prdVersions).values(data).returning();
    return version;
  }

  async getVersionsByPrdId(prdId: number): Promise<PrdVersion[]> {
    return db.select().from(prdVersions).where(eq(prdVersions.prdId, prdId)).orderBy(desc(prdVersions.createdAt));
  }

  async getAllTemplates(): Promise<CustomTemplate[]> {
    return db.select().from(customTemplates).orderBy(desc(customTemplates.createdAt));
  }

  async createTemplate(data: InsertCustomTemplate): Promise<CustomTemplate> {
    const [template] = await db.insert(customTemplates).values(data).returning();
    return template;
  }

  async deleteTemplate(id: number): Promise<void> {
    await db.delete(customTemplates).where(eq(customTemplates.id, id));
  }

  async logAnalytics(data: InsertAnalytics): Promise<Analytics> {
    const [event] = await db.insert(analytics).values(data).returning();
    return event;
  }

  async getAnalyticsSummary(): Promise<{ totalPrds: number; totalGenerations: number; avgGenerationTime: number }> {
    const [prdCount] = await db.select({ count: sql<number>`count(*)` }).from(prds);
    const [genStats] = await db
      .select({ 
        count: sql<number>`count(*)`,
        avgTime: sql<number>`coalesce(avg(generation_time_ms), 0)`
      })
      .from(analytics)
      .where(eq(analytics.eventType, 'prd_generated'));
    
    return {
      totalPrds: Number(prdCount?.count || 0),
      totalGenerations: Number(genStats?.count || 0),
      avgGenerationTime: Math.round(Number(genStats?.avgTime || 0)),
    };
  }

  async getAllToolResults(toolType?: string): Promise<ToolResult[]> {
    if (toolType) {
      return db.select().from(toolResults).where(eq(toolResults.toolType, toolType)).orderBy(desc(toolResults.createdAt));
    }
    return db.select().from(toolResults).orderBy(desc(toolResults.createdAt));
  }

  async getToolResult(id: number): Promise<ToolResult | undefined> {
    const [result] = await db.select().from(toolResults).where(eq(toolResults.id, id));
    return result;
  }

  async getToolResultByShareId(shareId: string): Promise<ToolResult | undefined> {
    const [result] = await db.select().from(toolResults).where(eq(toolResults.shareId, shareId));
    return result;
  }

  async createToolResult(data: InsertToolResult): Promise<ToolResult> {
    const [result] = await db.insert(toolResults).values(data).returning();
    return result;
  }

  async updateToolResult(id: number, data: Partial<InsertToolResult>): Promise<ToolResult | undefined> {
    const [result] = await db
      .update(toolResults)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(toolResults.id, id))
      .returning();
    return result;
  }

  async deleteToolResult(id: number): Promise<void> {
    await db.delete(toolResultVersions).where(eq(toolResultVersions.toolResultId, id));
    await db.delete(toolResults).where(eq(toolResults.id, id));
  }

  async generateToolResultShareId(id: number): Promise<string> {
    const result = await this.getToolResult(id);
    if (!result) throw new Error("Tool result not found");
    if (result.shareId) return result.shareId;

    const shareId = crypto.randomBytes(8).toString("hex");
    await db.update(toolResults).set({ shareId }).where(eq(toolResults.id, id));
    return shareId;
  }

  async createToolResultVersion(data: InsertToolResultVersion): Promise<ToolResultVersion> {
    const [version] = await db.insert(toolResultVersions).values(data).returning();
    return version;
  }

  async getToolResultVersions(toolResultId: number): Promise<ToolResultVersion[]> {
    return db.select().from(toolResultVersions).where(eq(toolResultVersions.toolResultId, toolResultId)).orderBy(desc(toolResultVersions.createdAt));
  }
}

export const storage = new PrdStorage();
