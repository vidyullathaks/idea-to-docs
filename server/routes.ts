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
  model: z.string().optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/prds", async (req, res) => {
    try {
      const prds = await storage.getAllPrds();
      res.json(prds);
    } catch (error) {
      console.error("Error fetching PRDs:", error);
      res.status(500).json({ message: "Failed to fetch PRDs" });
    }
  });

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

  app.get("/api/shared/:shareId", async (req, res) => {
    try {
      const prd = await storage.getPrdByShareId(req.params.shareId);
      if (!prd) {
        return res.status(404).json({ message: "Shared PRD not found" });
      }
      res.json(prd);
    } catch (error) {
      console.error("Error fetching shared PRD:", error);
      res.status(500).json({ message: "Failed to fetch shared PRD" });
    }
  });

  app.post("/api/prds/generate", async (req, res) => {
    try {
      const validation = generateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: validation.error.errors[0]?.message || "Invalid input" 
        });
      }

      const { idea, model } = validation.data;
      const startTime = Date.now();
      
      const generated = await generatePrd(idea, model);
      const generationTime = Date.now() - startTime;
      
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
      
      await storage.logAnalytics({
        eventType: 'prd_generated',
        prdId: prd.id,
        ideaLength: idea.length,
        generationTimeMs: generationTime,
        sessionId: req.headers['x-session-id'] as string || null,
      });
      
      res.status(201).json(prd);
    } catch (error) {
      console.error("Error generating PRD:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate PRD" 
      });
    }
  });

  const updatePrdSchema = z.object({
    title: z.string().optional(),
    problemStatement: z.string().optional(),
    targetAudience: z.string().optional(),
    goals: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    successMetrics: z.array(z.string()).optional(),
    outOfScope: z.array(z.string()).optional(),
    assumptions: z.array(z.string()).optional(),
    status: z.string().optional(),
  });

  app.patch("/api/prds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const validation = updatePrdSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0]?.message || "Invalid input" });
      }

      const currentPrd = await storage.getPrd(id);
      if (!currentPrd) {
        return res.status(404).json({ message: "PRD not found" });
      }

      const { id: _id, createdAt, updatedAt, ...snapshot } = currentPrd;
      await storage.createVersion({
        prdId: id,
        snapshot: snapshot as Record<string, unknown>,
        changeSummary: `Edited: ${Object.keys(validation.data).join(", ")}`,
      });

      const updated = await storage.updatePrd(id, validation.data);
      res.json(updated);
    } catch (error) {
      console.error("Error updating PRD:", error);
      res.status(500).json({ message: "Failed to update PRD" });
    }
  });

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

  app.post("/api/prds/:id/share", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const shareId = await storage.generateShareId(id);
      res.json({ shareId });
    } catch (error) {
      console.error("Error generating share link:", error);
      res.status(500).json({ message: "Failed to generate share link" });
    }
  });

  app.get("/api/prds/:id/versions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const versions = await storage.getVersionsByPrdId(id);
      res.json(versions);
    } catch (error) {
      console.error("Error fetching versions:", error);
      res.status(500).json({ message: "Failed to fetch version history" });
    }
  });

  app.post("/api/prds/:id/versions/:versionId/restore", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const versionId = parseInt(req.params.versionId);
      if (isNaN(id) || isNaN(versionId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const versions = await storage.getVersionsByPrdId(id);
      const version = versions.find(v => v.id === versionId);
      if (!version) {
        return res.status(404).json({ message: "Version not found" });
      }

      const currentPrd = await storage.getPrd(id);
      if (!currentPrd) {
        return res.status(404).json({ message: "PRD not found" });
      }

      const { id: _id, createdAt, updatedAt, ...currentSnapshot } = currentPrd;
      await storage.createVersion({
        prdId: id,
        snapshot: currentSnapshot as Record<string, unknown>,
        changeSummary: "Before restore",
      });

      const snapshot = version.snapshot as Record<string, unknown>;
      const updated = await storage.updatePrd(id, {
        title: snapshot.title as string,
        problemStatement: snapshot.problemStatement as string,
        targetAudience: snapshot.targetAudience as string,
        goals: snapshot.goals as string[],
        features: snapshot.features as string[],
        successMetrics: snapshot.successMetrics as string[],
        outOfScope: snapshot.outOfScope as string[],
        assumptions: snapshot.assumptions as string[],
        status: snapshot.status as string,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error restoring version:", error);
      res.status(500).json({ message: "Failed to restore version" });
    }
  });

  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  const templateSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    description: z.string().optional(),
    idea: z.string().min(20, "Template idea must be at least 20 characters"),
    category: z.string().optional(),
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const validation = templateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0]?.message || "Invalid input" });
      }
      const template = await storage.createTemplate(validation.data);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      await storage.deleteTemplate(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  const exportSchema = z.object({
    prdId: z.number().optional(),
    exportType: z.enum(['markdown', 'pdf', 'notion', 'jira']).optional().default('markdown'),
  });

  app.post("/api/analytics/export", async (req, res) => {
    try {
      const validation = exportSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0]?.message || "Invalid input" });
      }
      const { prdId, exportType } = validation.data;
      await storage.logAnalytics({
        eventType: 'prd_exported',
        prdId: prdId || null,
        exportType: exportType,
        sessionId: req.headers['x-session-id'] as string || null,
      });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error logging export:", error);
      res.status(500).json({ message: "Failed to log export" });
    }
  });

  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const summary = await storage.getAnalyticsSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/models", async (_req, res) => {
    res.json([
      { id: "gpt-4o", name: "GPT-4o", description: "Fast and capable" },
      { id: "o3-mini", name: "o3 Mini", description: "Efficient reasoning" },
      { id: "gpt-4.1", name: "GPT-4.1", description: "Latest model" },
    ]);
  });

  const userStoryInputSchema = z.object({
    featureIdea: z.string().min(10, "Feature idea must be at least 10 characters"),
  });

  app.post("/api/tools/user-stories", async (req, res) => {
    try {
      const validation = userStoryInputSchema.safeParse(req.body);
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
