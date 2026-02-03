import { db } from "./db";
import { prds, analytics, type Prd, type InsertPrd, type InsertAnalytics, type Analytics } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getAllPrds(): Promise<Prd[]>;
  getPrd(id: number): Promise<Prd | undefined>;
  createPrd(data: InsertPrd): Promise<Prd>;
  updatePrd(id: number, data: Partial<InsertPrd>): Promise<Prd | undefined>;
  deletePrd(id: number): Promise<void>;
  logAnalytics(data: InsertAnalytics): Promise<Analytics>;
  getAnalyticsSummary(): Promise<{ totalPrds: number; totalGenerations: number; avgGenerationTime: number }>;
}

export class PrdStorage implements IStorage {
  async getAllPrds(): Promise<Prd[]> {
    return db.select().from(prds).orderBy(desc(prds.createdAt));
  }

  async getPrd(id: number): Promise<Prd | undefined> {
    const [prd] = await db.select().from(prds).where(eq(prds.id, id));
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
    await db.delete(prds).where(eq(prds.id, id));
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
}

export const storage = new PrdStorage();
