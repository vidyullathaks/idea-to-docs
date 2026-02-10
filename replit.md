# IdeaForge - AI-Powered PM Toolkit

## Overview
IdeaForge is a comprehensive AI-powered PM toolkit with 7 tools that help product managers, founders, and aspiring PMs work faster. Built with React, Express, and OpenAI GPT-5.2.

## Recent Changes
- **2026-02-10**: Major expansion from PRD Generator to full PM Toolkit
  - Added 5 new AI-powered tools: User Story Generator, Problem Refiner, Feature Prioritizer (RICE), Sprint Planner, Interview Prep
  - Added sidebar navigation using Shadcn sidebar primitives + wouter routing
  - Added PRD templates (SaaS, Mobile, E-commerce, Developer Tool, Content Platform)
  - Added "Rewrite This Section" AI editing for individual PRD sections
  - Added Compare PRDs side-by-side view with diff badges
  - Updated About dialog with full toolkit description
- **2026-02-03**: Added hero section and UX improvements
- **2026-02-03**: Initial MVP with PRD Generator, analytics, exports, dark/light theme

## Tech Stack
- **Frontend**: React 18, TypeScript, TailwindCSS, Shadcn/ui, wouter
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-5.2 via Replit AI Integrations

## Project Architecture

### Directory Structure
```
├── client/src/
│   ├── components/
│   │   ├── ui/                    # Shadcn base components
│   │   ├── app-sidebar.tsx        # Sidebar navigation with 7 tools
│   │   ├── idea-input-form.tsx    # PRD idea input with template support
│   │   ├── prd-display.tsx        # PRD viewer with rewrite dialog
│   │   ├── prd-list.tsx           # PRD history sidebar
│   │   ├── loading-prd.tsx        # Generation loading state
│   │   ├── about-dialog.tsx       # About dialog with toolkit info
│   │   └── theme-*.tsx            # Theme provider and toggle
│   ├── pages/
│   │   ├── home.tsx               # PRD Generator (main page)
│   │   ├── tool-pages.tsx         # 5 AI tools (User Stories, Problem Refiner, etc.)
│   │   └── compare-prds.tsx       # Compare PRDs side-by-side
│   └── lib/
│       └── queryClient.ts         # TanStack Query setup
├── server/
│   ├── db.ts                      # Database connection
│   ├── storage.ts                 # PRD CRUD operations
│   ├── routes.ts                  # API endpoints (PRDs + 5 AI tools)
│   ├── openai.ts                  # AI generation (7 functions)
│   └── seed.ts                    # Sample data seeding
└── shared/
    └── schema.ts                  # Drizzle schema & types
```

### PM Tools
1. **PRD Generator** (/) — Generate full PRDs from product ideas with templates
2. **User Story Generator** (/user-stories) — Feature → stories + acceptance criteria + edge cases
3. **Problem Refiner** (/problem-refiner) — Messy problem → structured problem statement
4. **Feature Prioritizer** (/prioritization) — RICE scoring + recommendations
5. **Sprint Planner** (/sprint-planning) — Backlog → sprint plan + risks
6. **Interview Prep** (/interview-prep) — PM questions → structured answers + feedback
7. **Compare PRDs** (/compare) — Side-by-side PRD comparison with diff badges

### PRD Enhancement Features
- **Templates**: 5 pre-built starting points (SaaS, Mobile, E-commerce, Developer Tool, Content Platform)
- **Rewrite Section**: AI-powered editing of individual PRD sections with custom instructions
- **Compare**: Side-by-side comparison of any two PRDs with count differences

### API Endpoints
- `GET /api/prds` — List all PRDs
- `GET /api/prds/:id` — Get single PRD
- `POST /api/prds/generate` — Generate new PRD from idea
- `DELETE /api/prds/:id` — Delete PRD
- `POST /api/ai/user-stories` — Generate user stories
- `POST /api/ai/refine-problem` — Refine problem statement
- `POST /api/ai/prioritize-features` — RICE feature prioritization
- `POST /api/ai/sprint-plan` — Generate sprint plan
- `POST /api/ai/interview-prep` — PM interview prep
- `POST /api/ai/rewrite-section` — Rewrite PRD section

### Database Schema
```typescript
prds: {
  id: serial (PK)
  title: text
  rawIdea: text (required)
  problemStatement: text
  targetAudience: text
  goals: text[]
  features: text[]
  successMetrics: text[]
  userStories: jsonb (UserStory[])
  outOfScope: text[]
  assumptions: text[]
  status: text (default: "draft")
  createdAt: timestamp
  updatedAt: timestamp
}
```

## User Preferences
- Uses Inter font family for clean, modern typography
- Purple primary color (hsl 262) for branding
- Rounded corners on cards and buttons
- Smooth animations and transitions

## Running the App
The app runs on port 5000. Use `npm run dev` to start development server.
Database migrations: `npm run db:push`
