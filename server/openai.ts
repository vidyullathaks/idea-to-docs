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

export async function generatePrd(idea: string, model?: string): Promise<GeneratedPrd> {
  const response = await openai.chat.completions.create({
    model: model || "gpt-5.2",
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

const generatedUserStoriesSchema = z.object({
  featureName: z.string().default("Untitled Feature"),
  userStories: z.array(z.object({
    id: z.string().default(""),
    title: z.string().default(""),
    description: z.string().default(""),
    acceptanceCriteria: z.array(z.string()).default([]),
    edgeCases: z.array(z.string()).default([]),
    priority: z.enum(["high", "medium", "low"]).default("medium"),
  })).default([]),
});

export type GeneratedUserStories = z.infer<typeof generatedUserStoriesSchema>;

export async function generateUserStories(featureIdea: string, model?: string): Promise<GeneratedUserStories> {
  const response = await openai.chat.completions.create({
    model: model || "gpt-5.2",
    messages: [
      {
        role: "system",
        content: `You are an expert product manager specializing in generating comprehensive user stories. Given a feature idea or description, generate 5-8 detailed user stories with acceptance criteria and edge cases. Each story should follow the "As a [user], I want [goal] so that [benefit]" format. Be thorough about edge cases and acceptance criteria. Respond with valid JSON.`,
      },
      {
        role: "user",
        content: `Generate comprehensive user stories for the following feature idea:\n\n${featureIdea}\n\nRespond with JSON in this exact format:
{
  "featureName": "Feature Name",
  "userStories": [
    {
      "id": "us-1",
      "title": "Story title",
      "description": "As a user, I want...",
      "acceptanceCriteria": ["criteria 1", "criteria 2"],
      "edgeCases": ["edge case 1", "edge case 2"],
      "priority": "high"
    }
  ]
}`,
      },
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
    const validated = generatedUserStoriesSchema.parse(rawParsed);
    return {
      ...validated,
      userStories: validated.userStories.map((story, index) => ({
        ...story,
        id: story.id || `us-${index + 1}`,
      })),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("AI response validation error:", error.errors);
      throw new Error("Invalid AI response format");
    }
    throw new Error("Failed to parse AI response");
  }
}

const refinedProblemSchema = z.object({
  originalProblem: z.string().default(""),
  refinedStatement: z.string().default(""),
  context: z.string().default(""),
  impact: z.string().default(""),
  affectedUsers: z.string().default(""),
  currentSolutions: z.string().default(""),
  proposedApproach: z.string().default(""),
  successCriteria: z.array(z.string()).default([]),
});

export type RefinedProblem = z.infer<typeof refinedProblemSchema>;

export async function refineProblemStatement(messyProblem: string, model?: string): Promise<RefinedProblem> {
  const response = await openai.chat.completions.create({
    model: model || "gpt-5.2",
    messages: [
      {
        role: "system",
        content: `You are an expert product manager who excels at clarifying and structuring problem statements. Given a messy or unclear problem description, you will refine it into a clear, well-structured problem statement with full context, impact analysis, and success criteria. Respond with valid JSON.`,
      },
      {
        role: "user",
        content: `Refine and structure the following messy problem description:\n\n${messyProblem}\n\nRespond with JSON in this exact format:
{
  "originalProblem": "The original messy problem as provided",
  "refinedStatement": "A clear, concise problem statement",
  "context": "Background context and circumstances",
  "impact": "Business and user impact of this problem",
  "affectedUsers": "Who is affected and how",
  "currentSolutions": "Existing workarounds or solutions",
  "proposedApproach": "Recommended approach to solve this",
  "successCriteria": ["criterion 1", "criterion 2"]
}`,
      },
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
    return refinedProblemSchema.parse(rawParsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("AI response validation error:", error.errors);
      throw new Error("Invalid AI response format");
    }
    throw new Error("Failed to parse AI response");
  }
}

const prioritizedFeaturesSchema = z.object({
  features: z.array(z.object({
    name: z.string().default(""),
    reach: z.number().min(1).max(10).default(5),
    impact: z.number().min(1).max(10).default(5),
    confidence: z.number().min(1).max(10).default(5),
    effort: z.number().min(1).max(10).default(5),
    riceScore: z.number().default(0),
    reasoning: z.string().default(""),
    recommendation: z.enum(["must-have", "should-have", "could-have", "won't-have"]).default("could-have"),
    tradeoffs: z.string().default(""),
  })).default([]),
  summary: z.string().default(""),
});

export type PrioritizedFeatures = z.infer<typeof prioritizedFeaturesSchema>;

export async function prioritizeFeatures(features: string[], model?: string): Promise<PrioritizedFeatures> {
  const response = await openai.chat.completions.create({
    model: model || "gpt-5.2",
    messages: [
      {
        role: "system",
        content: `You are an expert product manager who uses the RICE framework (Reach, Impact, Confidence, Effort) to prioritize features. For each feature, score it on each RICE dimension (1-10), calculate the RICE score as (Reach * Impact * Confidence) / Effort, provide reasoning, a MoSCoW recommendation, and tradeoff analysis. Respond with valid JSON.`,
      },
      {
        role: "user",
        content: `Prioritize the following features using the RICE framework:\n\n${features.map((f, i) => `${i + 1}. ${f}`).join("\n")}\n\nRespond with JSON in this exact format:
{
  "features": [
    {
      "name": "Feature name",
      "reach": 8,
      "impact": 7,
      "confidence": 6,
      "effort": 5,
      "riceScore": 67.2,
      "reasoning": "Why this scoring",
      "recommendation": "must-have",
      "tradeoffs": "Tradeoff analysis"
    }
  ],
  "summary": "Overall prioritization summary and recommendations"
}`,
      },
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
    return prioritizedFeaturesSchema.parse(rawParsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("AI response validation error:", error.errors);
      throw new Error("Invalid AI response format");
    }
    throw new Error("Failed to parse AI response");
  }
}

const sprintPlanSchema = z.object({
  sprintGoal: z.string().default(""),
  duration: z.string().default("2 weeks"),
  capacity: z.string().default(""),
  stories: z.array(z.object({
    title: z.string().default(""),
    storyPoints: z.number().default(0),
    priority: z.enum(["high", "medium", "low"]).default("medium"),
    assignmentSuggestion: z.string().default(""),
  })).default([]),
  risks: z.array(z.object({
    risk: z.string().default(""),
    mitigation: z.string().default(""),
    severity: z.enum(["high", "medium", "low"]).default("medium"),
  })).default([]),
  totalPoints: z.number().default(0),
  recommendations: z.array(z.string()).default([]),
});

export type SprintPlan = z.infer<typeof sprintPlanSchema>;

export async function planSprint(backlog: string, model?: string): Promise<SprintPlan> {
  const response = await openai.chat.completions.create({
    model: model || "gpt-5.2",
    messages: [
      {
        role: "system",
        content: `You are an expert scrum master specializing in sprint planning. Given a backlog description, you will create a detailed sprint plan with a clear sprint goal, story point estimates, priority assignments, risk analysis, and actionable recommendations. Respond with valid JSON.`,
      },
      {
        role: "user",
        content: `Plan a sprint based on the following backlog:\n\n${backlog}\n\nRespond with JSON in this exact format:
{
  "sprintGoal": "Clear sprint goal statement",
  "duration": "2 weeks",
  "capacity": "Team capacity description",
  "stories": [
    {
      "title": "Story title",
      "storyPoints": 5,
      "priority": "high",
      "assignmentSuggestion": "Suggested role or team member type"
    }
  ],
  "risks": [
    {
      "risk": "Risk description",
      "mitigation": "Mitigation strategy",
      "severity": "high"
    }
  ],
  "totalPoints": 30,
  "recommendations": ["recommendation 1", "recommendation 2"]
}`,
      },
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
    return sprintPlanSchema.parse(rawParsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("AI response validation error:", error.errors);
      throw new Error("Invalid AI response format");
    }
    throw new Error("Failed to parse AI response");
  }
}

const interviewAnswerSchema = z.object({
  question: z.string().default(""),
  framework: z.string().default(""),
  structuredAnswer: z.string().default(""),
  keyPoints: z.array(z.string()).default([]),
  exampleScenario: z.string().default(""),
  followUpQuestions: z.array(z.string()).default([]),
  feedback: z.string().default(""),
  tips: z.array(z.string()).default([]),
});

export type InterviewAnswer = z.infer<typeof interviewAnswerSchema>;

export async function prepareInterviewAnswer(question: string, model?: string): Promise<InterviewAnswer> {
  const response = await openai.chat.completions.create({
    model: model || "gpt-5.2",
    messages: [
      {
        role: "system",
        content: `You are a senior PM interview coach with extensive experience at top tech companies. Given a PM interview question, provide a structured answer using an appropriate framework, key talking points, a concrete example scenario, potential follow-up questions, constructive feedback, and practical tips. Respond with valid JSON.`,
      },
      {
        role: "user",
        content: `Prepare a strong answer for the following PM interview question:\n\n${question}\n\nRespond with JSON in this exact format:
{
  "question": "The original question",
  "framework": "Name and description of the framework used",
  "structuredAnswer": "A complete, well-structured answer",
  "keyPoints": ["key point 1", "key point 2"],
  "exampleScenario": "A concrete example scenario to illustrate the answer",
  "followUpQuestions": ["follow-up 1", "follow-up 2"],
  "feedback": "Constructive feedback on how to improve the answer",
  "tips": ["tip 1", "tip 2"]
}`,
      },
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
    return interviewAnswerSchema.parse(rawParsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("AI response validation error:", error.errors);
      throw new Error("Invalid AI response format");
    }
    throw new Error("Failed to parse AI response");
  }
}

const rewrittenSectionSchema = z.object({
  rewrittenContent: z.string().default(""),
});

export async function rewritePrdSection(sectionName: string, currentContent: string, instruction: string): Promise<{ rewrittenContent: string }> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content: `You are an expert product manager specializing in writing and refining PRD sections. Given a section name, its current content, and a rewrite instruction, produce an improved version of the section content. Maintain professional tone and ensure the rewritten content is clear, specific, and actionable. Respond with valid JSON.`,
      },
      {
        role: "user",
        content: `Rewrite the following PRD section based on the given instruction.\n\nSection: ${sectionName}\n\nCurrent Content:\n${currentContent}\n\nInstruction: ${instruction}\n\nRespond with JSON in this exact format:
{
  "rewrittenContent": "The improved section content"
}`,
      },
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
    const validated = rewrittenSectionSchema.parse(rawParsed);
    return { rewrittenContent: validated.rewrittenContent ?? "" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("AI response validation error:", error.errors);
      throw new Error("Invalid AI response format");
    }
    throw new Error("Failed to parse AI response");
  }
}
