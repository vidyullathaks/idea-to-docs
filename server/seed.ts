import { db } from "./db";
import { prds } from "@shared/schema";
import type { UserStory } from "@shared/schema";

const samplePrds = [
  {
    title: "TaskFlow - Smart Task Management",
    rawIdea: "A task management app that uses AI to automatically prioritize tasks and suggest optimal scheduling",
    problemStatement: "Professionals struggle with managing multiple tasks and often spend too much time deciding what to work on next, leading to missed deadlines and reduced productivity.",
    targetAudience: "Busy professionals, project managers, and freelancers who juggle multiple projects and need intelligent task prioritization to maximize their productivity.",
    goals: [
      "Reduce time spent on task prioritization by 70%",
      "Improve user task completion rate by 40%",
      "Achieve 50,000 monthly active users within first year",
      "Maintain user satisfaction score above 4.5/5"
    ],
    features: [
      "AI-powered task prioritization based on urgency, importance, and deadlines",
      "Smart calendar integration for optimal task scheduling",
      "Natural language task input and voice commands",
      "Team collaboration with shared task boards",
      "Progress analytics and productivity insights",
      "Cross-platform sync (web, mobile, desktop)"
    ],
    successMetrics: [
      "Daily active users and retention rate",
      "Average tasks completed per user per week",
      "Time from task creation to completion",
      "Net Promoter Score (NPS)"
    ],
    userStories: [
      {
        id: "us-1",
        title: "Quick Task Creation",
        description: "As a busy professional, I want to quickly add tasks using natural language so that I can capture ideas without breaking my workflow.",
        acceptanceCriteria: [
          "User can type or speak a task in natural language",
          "AI automatically extracts due date, priority, and category",
          "Task is created within 2 seconds",
          "User receives confirmation with extracted details"
        ],
        priority: "high"
      },
      {
        id: "us-2",
        title: "Smart Daily Planning",
        description: "As a user starting my day, I want the app to suggest an optimal task order so that I can focus on execution rather than planning.",
        acceptanceCriteria: [
          "Daily plan is generated based on deadlines and priorities",
          "User can accept, modify, or regenerate the plan",
          "Plan considers estimated task duration",
          "Notifications remind user of upcoming tasks"
        ],
        priority: "high"
      },
      {
        id: "us-3",
        title: "Progress Dashboard",
        description: "As a user, I want to see my productivity trends so that I can identify patterns and improve my work habits.",
        acceptanceCriteria: [
          "Dashboard shows tasks completed over time",
          "Charts display productivity by day/week/month",
          "Insights highlight peak productivity times",
          "Export functionality for reports"
        ],
        priority: "medium"
      }
    ] as UserStory[],
    outOfScope: [
      "Built-in video conferencing",
      "Full project management suite (Gantt charts, resource allocation)",
      "Custom workflow automation",
      "Third-party marketplace integrations"
    ],
    assumptions: [
      "Users have consistent internet connectivity",
      "Target users are comfortable with AI-assisted features",
      "Mobile usage will be primary access method",
      "Users typically manage 10-50 active tasks"
    ],
    status: "draft"
  },
  {
    title: "EcoTrack - Personal Carbon Footprint Monitor",
    rawIdea: "An app that helps individuals track and reduce their carbon footprint through daily activity monitoring and personalized suggestions",
    problemStatement: "Most people want to reduce their environmental impact but lack visibility into their carbon footprint and don't know which actions would be most effective.",
    targetAudience: "Environmentally conscious consumers aged 25-45 who want to make sustainable choices but need guidance on where to focus their efforts.",
    goals: [
      "Help users reduce personal carbon footprint by 20% in first year",
      "Reach 100,000 downloads in first 6 months",
      "Partner with 10 sustainable brands for rewards program",
      "Achieve carbon offset equivalent to 1M trees planted by year 2"
    ],
    features: [
      "Automatic activity tracking (transport, purchases, energy usage)",
      "Real-time carbon footprint calculation and visualization",
      "Personalized reduction recommendations",
      "Gamification with challenges and rewards",
      "Community leaderboards and group challenges",
      "Integration with smart home devices"
    ],
    successMetrics: [
      "Average carbon reduction per active user",
      "Weekly engagement rate",
      "Challenge completion rate",
      "Social sharing metrics"
    ],
    userStories: [
      {
        id: "us-1",
        title: "Daily Impact Summary",
        description: "As an eco-conscious user, I want to see my daily carbon impact so that I understand how my choices affect the environment.",
        acceptanceCriteria: [
          "Dashboard shows daily carbon footprint in understandable units",
          "Breakdown by category (transport, food, energy, purchases)",
          "Comparison to average and personal goal",
          "Trend visualization for past 30 days"
        ],
        priority: "high"
      },
      {
        id: "us-2",
        title: "Actionable Recommendations",
        description: "As a user wanting to improve, I want personalized suggestions so that I can take effective actions to reduce my footprint.",
        acceptanceCriteria: [
          "Recommendations are based on user's actual behavior",
          "Each suggestion shows potential CO2 savings",
          "Difficulty level and cost indicators included",
          "User can mark suggestions as completed or dismissed"
        ],
        priority: "high"
      }
    ] as UserStory[],
    outOfScope: [
      "Corporate carbon accounting",
      "Carbon credit marketplace",
      "Hardware devices for monitoring",
      "Detailed supply chain analysis"
    ],
    assumptions: [
      "Users are willing to share activity data for tracking",
      "Approximate calculations are acceptable for most users",
      "Gamification motivates sustained engagement",
      "Users prefer mobile-first experience"
    ],
    status: "draft"
  }
];

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existing = await db.select().from(prds).limit(1);
    if (existing.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database with sample PRDs...");
    
    for (const prdData of samplePrds) {
      await db.insert(prds).values(prdData);
    }
    
    console.log(`Successfully seeded ${samplePrds.length} PRDs`);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
