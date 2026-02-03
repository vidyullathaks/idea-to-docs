import { db } from "./db";
import { prds, type Prd, type InsertPrd } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAllPrds(): Promise<Prd[]>;
  getPrd(id: number): Promise<Prd | undefined>;
  createPrd(data: InsertPrd): Promise<Prd>;
  updatePrd(id: number, data: Partial<InsertPrd>): Promise<Prd | undefined>;
  deletePrd(id: number): Promise<void>;
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
}

export const storage = new PrdStorage();
