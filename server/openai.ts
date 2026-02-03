import OpenAI from "openai";
import { userStorySchema, type UserStory } from "@shared/schema";
import { z } from "zod";

if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY || !process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
  console.warn("OpenAI credentials not configured. PRD generation will fail.");
}

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Schema for validating AI response
const generatedPrdSchema = z.object({
  title: z.string().min(1).default("Untitled PRD"),
  problemStatement: z.string().default(""),
  targetAudience: z.string().default(""),
  goals: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  successMetrics: z.array(z.string()).default([]),
  userStories: z.array(userStorySchema).default([]),
  outOfScope: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
});

interface GeneratedPrd {
  title: string;
  problemStatement: string;
  targetAudience: string;
  goals: string[];
  features: string[];
  successMetrics: string[];
  userStories: UserStory[];
  outOfScope: string[];
  assumptions: string[];
}

const systemPrompt = `You are an expert product manager specializing in creating detailed Product Requirements Documents (PRDs). 
When given a rough product idea, you will transform it into a structured PRD with the following components:

1. **Title**: A concise, compelling name for the product
2. **Problem Statement**: Clearly articulate the problem this product solves
3. **Target Audience**: Describe the primary users and their characteristics
4. **Goals & Objectives**: List 3-5 measurable goals
5. **Key Features**: List 5-8 core features with brief descriptions
6. **Success Metrics**: List 3-5 KPIs to measure success
7. **User Stories**: Generate 4-6 user stories with acceptance criteria
8. **Out of Scope**: List items explicitly not included in MVP
9. **Assumptions**: List key assumptions being made

For user stories, use the format:
- Title: Brief summary
- Description: "As a [user type], I want [goal] so that [benefit]"
- Acceptance Criteria: 3-5 specific, testable criteria
- Priority: high, medium, or low

Respond with valid JSON matching the exact structure requested. Be thorough and specific.`;

export async function generatePrd(idea: string): Promise<GeneratedPrd> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: `Generate a comprehensive PRD for the following product idea:\n\n${idea}\n\nRespond with JSON in this exact format:
{
  "title": "Product Name",
  "problemStatement": "...",
  "targetAudience": "...",
  "goals": ["goal 1", "goal 2", ...],
  "features": ["feature 1", "feature 2", ...],
  "successMetrics": ["metric 1", "metric 2", ...],
  "userStories": [
    {
      "id": "us-1",
      "title": "Story title",
      "description": "As a user, I want...",
      "acceptanceCriteria": ["criteria 1", "criteria 2", ...],
      "priority": "high"
    }
  ],
  "outOfScope": ["item 1", "item 2", ...],
  "assumptions": ["assumption 1", "assumption 2", ...]
}`
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  try {
    const rawParsed = JSON.parse(content);
    
    // Validate with Zod schema, applying defaults for missing fields
    const validated = generatedPrdSchema.parse(rawParsed);
    
    // Ensure user stories have valid IDs and priorities
    const userStories = validated.userStories.map((story, index) => ({
      ...story,
      id: story.id || `us-${index + 1}`,
      priority: story.priority || "medium",
    }));
    
    return {
      ...validated,
      userStories,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("AI response validation error:", error.errors);
      throw new Error("Invalid AI response format");
    }
    throw new Error("Failed to parse AI response");
  }
}
