import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePrd } from "./openai";
import { z } from "zod";

const generateSchema = z.object({
  idea: z.string().min(20, "Idea must be at least 20 characters"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get all PRDs
  app.get("/api/prds", async (req, res) => {
    try {
      const prds = await storage.getAllPrds();
      res.json(prds);
    } catch (error) {
      console.error("Error fetching PRDs:", error);
      res.status(500).json({ message: "Failed to fetch PRDs" });
    }
  });

  // Get single PRD
  app.get("/api/prds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const prd = await storage.getPrd(id);
      if (!prd) {
        return res.status(404).json({ message: "PRD not found" });
      }
      
      res.json(prd);
    } catch (error) {
      console.error("Error fetching PRD:", error);
      res.status(500).json({ message: "Failed to fetch PRD" });
    }
  });

  // Generate PRD with AI
  app.post("/api/prds/generate", async (req, res) => {
    try {
      const validation = generateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: validation.error.errors[0]?.message || "Invalid input" 
        });
      }

      const { idea } = validation.data;
      
      // Generate PRD using AI
      const generated = await generatePrd(idea);
      
      // Save to database
      const prd = await storage.createPrd({
        rawIdea: idea,
        title: generated.title,
        problemStatement: generated.problemStatement,
        targetAudience: generated.targetAudience,
        goals: generated.goals,
        features: generated.features,
        successMetrics: generated.successMetrics,
        userStories: generated.userStories,
        outOfScope: generated.outOfScope,
        assumptions: generated.assumptions,
        status: "draft",
      });
      
      res.status(201).json(prd);
    } catch (error) {
      console.error("Error generating PRD:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate PRD" 
      });
    }
  });

  // Delete PRD
  app.delete("/api/prds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      await storage.deletePrd(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting PRD:", error);
      res.status(500).json({ message: "Failed to delete PRD" });
    }
  });

  return httpServer;
}
