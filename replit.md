# IdeaForge - AI-Powered PM Toolkit

## Overview
IdeaForge is a comprehensive AI-powered PM toolkit with 7+ tools that help product managers, founders, and aspiring PMs work faster. Built with React, Express, and OpenAI GPT-5.2.

## Recent Changes
- **2026-02-28**: Multi-model support with Claude integration
  - Added model selector with 7 models across 2 providers to all tool pages and PRD Generator
  - OpenAI models: GPT-5.2 (default), GPT-4.1, GPT-4o, o3 Mini
  - Anthropic models: Claude Opus 4.6, Claude Sonnet 4.6, Claude Haiku 4.5
  - Created reusable ModelSelector component with provider grouping (client/src/components/model-selector.tsx)
  - Created unified generateJsonCompletion helper that routes to OpenAI or Anthropic based on model prefix
  - All backend AI generation functions accept optional `model` parameter
  - All API routes pass model through to AI calls
  - GET /api/models endpoint returns available models with descriptions and provider info
  - Moved "Multi-model support" from roadmap to shipped features on home page
- **2026-02-10**: Extended production features to ALL 5 AI tools
  - Created tool_results and tool_result_versions database tables for persistent storage
  - Built reusable ToolResultDisplay component with inline editing, version history, shareable links, and export
  - All 5 tool pages now save results to DB on generation
  - Added Tool Results History page (/tool-results) with view/delete
  - Added Tool Result Detail page (/tool-results/:id) for individual viewing
  - Added Shared Tool Result page (/share/tool/:shareId) for read-only sharing
  - Sidebar updated with "Tool Results" link
- **2026-02-10**: Production features implementation
  - Inline editing: Click pencil icon on any PRD section to edit directly, with Save/Cancel
  - Version history: Every edit creates a snapshot; view and restore past versions via History dialog
  - Shareable links: Generate unique share URLs (/share/:shareId) for read-only PRD sharing
  - Custom templates: Create, manage, and reuse custom templates at /templates
  - PDF & Markdown export: Download PRDs as markdown files or print-to-PDF
  - AI Rewrite: Use RotateCcw icon to AI-rewrite individual sections with custom instructions
  - Updated home page: "What You Can Do" section showing shipped features + "Coming Soon" for planned items
  - Database tables: prd_versions, custom_templates added; share_id column on prds
- **2026-02-10**: Landing page restructure and roadmap
  - Reduced templates to 2 on home page (SaaS, Mobile)
  - Moved PRD history to dedicated /prds page with "View Your PRDs" button
  - Home page now focuses on the input form with less scrolling
- **2026-02-10**: Major expansion from PRD Generator to full PM Toolkit
  - Added 5 new AI-powered tools: User Story Generator, Problem Refiner, Feature Prioritizer (RICE), Sprint Planner, Interview Prep
  - Added sidebar navigation using Shadcn sidebar primitives + wouter routing
  - Added PRD templates (SaaS, Mobile, E-commerce, Developer Tool, Content Platform)
  - Added "Rewrite This Section" AI editing for individual PRD sections
  - Added Compare PRDs side-by-side view with diff badges
- **2026-02-03**: Initial MVP with PRD Generator, analytics, exports, dark/light theme

## Tech Stack
- **Frontend**: React 18, TypeScript, TailwindCSS, Shadcn/ui, wouter, date-fns
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-5.2 via Replit AI Integrations

## Project Architecture

### Directory Structure
```
├── client/src/
│   ├── components/
│   │   ├── ui/                    # Shadcn base components
│   │   ├── app-sidebar.tsx        # Sidebar navigation with tools + templates
│   │   ├── idea-input-form.tsx    # PRD idea input with template support
│   │   ├── prd-display.tsx        # PRD viewer with inline editing, version history, sharing, export
│   │   ├── loading-prd.tsx        # Generation loading state
│   │   ├── about-dialog.tsx       # About dialog with toolkit info
│   │   └── theme-*.tsx            # Theme provider and toggle
│   ├── pages/
│   │   ├── home.tsx               # Landing page with input, templates, features/roadmap
│   │   ├── prds.tsx               # PRD history page (view/delete/edit PRDs)
│   │   ├── templates.tsx          # Custom templates CRUD page
│   │   ├── shared-prd.tsx         # Read-only shared PRD view (/share/:shareId)
│   │   ├── tool-pages.tsx         # 5 AI tools (User Stories, Problem Refiner, etc.)
│   │   └── compare-prds.tsx       # Compare PRDs side-by-side
│   └── lib/
│       └── queryClient.ts         # TanStack Query setup
├── server/
│   ├── db.ts                      # Database connection
│   ├── storage.ts                 # PRD, version, template CRUD operations
│   ├── routes.ts                  # API endpoints (PRDs + tools + templates + versions + sharing)
│   ├── openai.ts                  # AI generation (7 functions, optional model param)
│   └── seed.ts                    # Sample data seeding
└── shared/
    └── schema.ts                  # Drizzle schema & types (prds, prd_versions, custom_templates, analytics, users)
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
- **Inline Editing**: Click pencil icon on any section to edit directly with Save/Cancel
- **AI Rewrite**: RotateCcw icon triggers AI-powered rewriting with custom instructions
- **Version History**: Automatic snapshots on every edit; view/restore via History dialog
- **Shareable Links**: Generate unique URLs for read-only PRD sharing
- **Export**: Copy as markdown, download as .md file, or print to PDF
- **Custom Templates**: Create/manage reusable product idea templates at /templates

### API Endpoints
- `GET /api/prds` — List all PRDs
- `GET /api/prds/:id` — Get single PRD
- `POST /api/prds/generate` — Generate new PRD from idea (optional model param)
- `PATCH /api/prds/:id` — Update PRD fields (creates version snapshot)
- `DELETE /api/prds/:id` — Delete PRD (cascades versions)
- `POST /api/prds/:id/share` — Generate shareable link
- `GET /api/shared/:shareId` — Get PRD by share ID (read-only)
- `GET /api/prds/:id/versions` — Get version history
- `POST /api/prds/:id/versions/:versionId/restore` — Restore a version
- `GET /api/templates` — List custom templates
- `POST /api/templates` — Create custom template
- `DELETE /api/templates/:id` — Delete custom template
- `GET /api/models` — List available AI models
- `POST /api/tools/*` — Various AI tool endpoints
- `POST /api/analytics/export` — Log export analytics
- `GET /api/analytics/summary` — Get analytics summary

### Database Schema
```typescript
prds: {
  id: serial (PK), title: text, rawIdea: text (required),
  problemStatement: text, targetAudience: text,
  goals: text[], features: text[], successMetrics: text[],
  userStories: jsonb (UserStory[]), outOfScope: text[], assumptions: text[],
  status: text (default: "draft"), shareId: text (unique),
  createdAt: timestamp, updatedAt: timestamp
}

prd_versions: {
  id: serial (PK), prdId: integer, snapshot: jsonb,
  changeSummary: text, createdAt: timestamp
}

custom_templates: {
  id: serial (PK), name: text, description: text,
  idea: text, category: text (default: "custom"), createdAt: timestamp
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
