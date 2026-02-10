import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  generatePrd,
  generateUserStories,
  refineProblemStatement,
  prioritizeFeatures,
  planSprint,
  prepareInterviewAnswer,
  rewritePrdSection,
} from "./openai";
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
      const startTime = Date.now();
      
      // Generate PRD using AI
      const generated = await generatePrd(idea);
      
      const generationTime = Date.now() - startTime;
      
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
      
      // Log analytics
      await storage.logAnalytics({
        eventType: 'prd_generated',
        prdId: prd.id,
        ideaLength: idea.length,
        generationTimeMs: generationTime,
        sessionId: req.headers['x-session-id'] as string || null,
      });
      
      console.log(`[Analytics] PRD generated: id=${prd.id}, ideaLength=${idea.length}, time=${generationTime}ms`);
      
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

  // Log export event
  const exportSchema = z.object({
    prdId: z.number().optional(),
    exportType: z.enum(['markdown', 'notion', 'jira']).optional().default('markdown'),
  });

  app.post("/api/analytics/export", async (req, res) => {
    try {
      const validation = exportSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: validation.error.errors[0]?.message || "Invalid input" 
        });
      }

      const { prdId, exportType } = validation.data;
      
      await storage.logAnalytics({
        eventType: 'prd_exported',
        prdId: prdId || null,
        exportType: exportType,
        sessionId: req.headers['x-session-id'] as string || null,
      });
      
      console.log(`[Analytics] PRD exported: prdId=${prdId}, type=${exportType}`);
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error logging export:", error);
      res.status(500).json({ message: "Failed to log export" });
    }
  });

  // Get analytics summary
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const summary = await storage.getAnalyticsSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const userStorySchema = z.object({
    featureIdea: z.string().min(10, "Feature idea must be at least 10 characters"),
  });

  app.post("/api/tools/user-stories", async (req, res) => {
    try {
      const validation = userStorySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0]?.message || "Invalid input" });
      }
      const result = await generateUserStories(validation.data.featureIdea);
      res.json(result);
    } catch (error) {
      console.error("Error generating user stories:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate user stories" });
    }
  });

  const problemSchema = z.object({
    problem: z.string().min(10, "Problem description must be at least 10 characters"),
  });

  app.post("/api/tools/refine-problem", async (req, res) => {
    try {
      const validation = problemSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0]?.message || "Invalid input" });
      }
      const result = await refineProblemStatement(validation.data.problem);
      res.json(result);
    } catch (error) {
      console.error("Error refining problem:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to refine problem statement" });
    }
  });

  const featuresSchema = z.object({
    features: z.array(z.string().min(1)).min(2, "Provide at least 2 features to prioritize"),
  });

  app.post("/api/tools/prioritize-features", async (req, res) => {
    try {
      const validation = featuresSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0]?.message || "Invalid input" });
      }
      const result = await prioritizeFeatures(validation.data.features);
      res.json(result);
    } catch (error) {
      console.error("Error prioritizing features:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to prioritize features" });
    }
  });

  const sprintSchema = z.object({
    backlog: z.string().min(20, "Backlog must be at least 20 characters"),
  });

  app.post("/api/tools/plan-sprint", async (req, res) => {
    try {
      const validation = sprintSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0]?.message || "Invalid input" });
      }
      const result = await planSprint(validation.data.backlog);
      res.json(result);
    } catch (error) {
      console.error("Error planning sprint:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to plan sprint" });
    }
  });

  const interviewSchema = z.object({
    question: z.string().min(10, "Question must be at least 10 characters"),
  });

  app.post("/api/tools/interview-prep", async (req, res) => {
    try {
      const validation = interviewSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0]?.message || "Invalid input" });
      }
      const result = await prepareInterviewAnswer(validation.data.question);
      res.json(result);
    } catch (error) {
      console.error("Error preparing interview answer:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to prepare interview answer" });
    }
  });

  const rewriteSchema = z.object({
    sectionName: z.string().min(1),
    currentContent: z.string().min(1),
    instruction: z.string().min(5, "Rewrite instruction must be at least 5 characters"),
  });

  app.post("/api/tools/rewrite-section", async (req, res) => {
    try {
      const validation = rewriteSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0]?.message || "Invalid input" });
      }
      const { sectionName, currentContent, instruction } = validation.data;
      const result = await rewritePrdSection(sectionName, currentContent, instruction);
      res.json(result);
    } catch (error) {
      console.error("Error rewriting section:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to rewrite section" });
    }
  });

  return httpServer;
}
