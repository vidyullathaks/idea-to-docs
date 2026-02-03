# IdeaForge - AI-Powered PRD Generator

## Overview
IdeaForge is an AI-powered tool that transforms rough product ideas into structured Product Requirements Documents (PRDs), user stories, and acceptance criteria. Built with a modern React frontend and Express backend, powered by OpenAI's GPT-5.2 model.

## Recent Changes
- **2026-02-03**: Added hero section and UX improvements
  - Compelling hero headline: "Turn Any Idea Into a Complete PRD"
  - "How It Works" section with 3 steps (Describe, Generate, Export)
  - Footer with branding "IdeaForge — AI-Powered PRD Generator"
  - Hero section contextually shows/hides based on view state
- **2026-02-03**: Added analytics, About section, AI disclaimer, and export options
  - Analytics table tracks PRD generation time, idea length, and export events
  - About dialog with app description, target users, usage instructions, and live stats
  - AI disclaimer warning alert at bottom of PRD display
  - Notion/Jira export buttons (placeholder prompts) with analytics logging
- **2026-02-03**: Initial MVP implementation
  - Created PRD data model with user stories and acceptance criteria
  - Built beautiful React UI with theme support
  - Integrated OpenAI for PRD generation
  - Added sample seed data for demonstration

## Tech Stack
- **Frontend**: React 18, TypeScript, TailwindCSS, Shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-5.2 via Replit AI Integrations

## Project Architecture

### Directory Structure
```
├── client/src/
│   ├── components/       # UI components
│   │   ├── ui/           # Shadcn base components
│   │   ├── header.tsx    # App header with branding
│   │   ├── theme-*.tsx   # Theme provider and toggle
│   │   ├── idea-input-form.tsx  # Product idea input
│   │   ├── prd-display.tsx      # PRD viewer with sections
│   │   ├── prd-list.tsx         # Sidebar with PRD history
│   │   └── loading-prd.tsx      # Generation loading state
│   ├── pages/
│   │   └── home.tsx      # Main application page
│   └── lib/
│       └── queryClient.ts # TanStack Query setup
├── server/
│   ├── db.ts             # Database connection
│   ├── storage.ts        # PRD CRUD operations
│   ├── routes.ts         # API endpoints
│   ├── openai.ts         # AI generation logic
│   └── seed.ts           # Sample data seeding
└── shared/
    └── schema.ts         # Drizzle schema & types
```

### Key Features
1. **Idea Input**: Natural language input for product ideas with example suggestions
2. **AI Generation**: Transforms ideas into comprehensive PRDs with:
   - Problem statement
   - Target audience
   - Goals & objectives
   - Key features
   - Success metrics
   - User stories with acceptance criteria
   - Out of scope items
   - Assumptions
3. **PRD History**: Browse and view previously generated PRDs
4. **Copy to Clipboard**: Export PRDs as formatted Markdown
5. **Dark/Light Theme**: System-aware theme toggle

### API Endpoints
- `GET /api/prds` - List all PRDs
- `GET /api/prds/:id` - Get single PRD
- `POST /api/prds/generate` - Generate new PRD from idea
- `DELETE /api/prds/:id` - Delete PRD

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
