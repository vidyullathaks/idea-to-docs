# **IdeaForge - AI-Powered PM Toolkit**
Transform rough product ideas into complete PRDs, user stories, sprint plans, and more — powered by AI.

**[Live Demo](https://idea-to-docs.replit.app)** | **[Source Code](https://github.com/vidyullathaks/idea-to-docs)**

---

## Overview
**IdeaForge** is a full-stack AI-powered Product Management toolkit that goes beyond simple PRD generation. It provides six specialized AI tools designed for product managers, founders, students, and teams who want to accelerate product definition and planning.

Users describe their idea, and IdeaForge generates a structured PRD containing:

- Problem Statement
- Target Audience
- Goals & Objectives
- Key Features
- Success Metrics
- Out of Scope
- Assumptions
- User Stories with Acceptance Criteria

Beyond PRD generation, the toolkit includes five additional AI-powered tools for the full product management workflow.

---

## Why This Project Exists
Writing PRDs and preparing product artifacts is one of the most time-consuming parts of product management. IdeaForge helps users:

- Move from idea to structured PRD in seconds
- Generate user stories, refine problems, and prioritize features with AI
- Plan sprints and prepare for PM interviews
- Explore multiple product directions quickly
- Improve clarity before involving engineering
- Learn how strong product artifacts are structured

This project also demonstrates practical AI product development, prompt engineering, and full-stack deployment.

---

## Key Features

### PRD Generator (Core Feature)
Input a product idea (minimum 20 characters) and receive a complete, structured PRD with all standard sections. PRDs can be edited inline, rewritten by AI, versioned, exported, and shared.

### AI-Powered PM Tools
- **User Story Generator** — Convert feature descriptions into detailed user stories with acceptance criteria and edge cases
- **Problem Refiner** — Turn messy problem descriptions into structured, clear problem statements
- **Feature Prioritizer** — Evaluate features using RICE scoring with AI-generated recommendations
- **Sprint Planner** — Transform a backlog into a sprint plan with risk assessment and recommendations
- **Interview Prep** — Get structured answers and feedback for PM interview questions

### Inline Editing & AI Rewrite
Click to edit any section of a PRD. Use AI to rewrite sections with custom instructions.

### Version History
Every edit creates an automatic snapshot. Browse and restore any previous version of a PRD or tool result.

### Shareable Links
Generate unique read-only URLs to share PRDs and tool results with others.

### Export
Download PRDs as Markdown or PDF.

### Custom Templates
Create, manage, and reuse product idea templates to speed up PRD generation.

### Compare PRDs
View two or more PRDs side by side for comparison.

### Tool Results Library
All AI tool outputs are saved, versioned, and shareable — just like PRDs.

### Dark / Light Mode
Toggle between dark and light themes.

### Preloaded Examples
Sample PRDs and idea templates help users get started quickly.

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (dev server and bundler)
- TailwindCSS + ShadCN UI (50+ components)
- TanStack React Query (data fetching and caching)
- Wouter (lightweight routing)
- Framer Motion (animations)
- React Hook Form + Zod (form handling and validation)
- next-themes (dark mode)
- Lucide React (icons)
- date-fns (date utilities)

### Backend
- Node.js + Express.js 5 + TypeScript
- Drizzle ORM (type-safe database access and migrations)
- PostgreSQL
- OpenAI SDK (GPT-5.2 default, with gpt-4o, o3-mini, gpt-4.1 selectable via Replit AI services)
- Passport (authentication)
- express-session (session management)
- Zod (API input validation)

### Infrastructure
- Hosted on Replit
- GitHub for version control
- Vite + ESBuild for production bundling
- Drizzle Kit for schema migrations

---

## Project Structure

```
idea-to-docs/
├── client/                        # Frontend
│   ├── index.html                 # HTML entry point
│   ├── public/                    # Static assets
│   └── src/
│       ├── main.tsx               # React entry point
│       ├── App.tsx                # Routing and layout
│       ├── index.css              # Global styles (light/dark themes)
│       ├── components/
│       │   ├── idea-input-form.tsx      # Product idea input form
│       │   ├── prd-display.tsx          # PRD viewer (edit, version, share, export)
│       │   ├── prd-list.tsx             # Saved PRDs list
│       │   ├── tool-result-display.tsx  # AI tool result viewer
│       │   ├── app-sidebar.tsx          # Navigation sidebar
│       │   ├── header.tsx               # Page header
│       │   ├── theme-provider.tsx       # Dark/light mode provider
│       │   ├── theme-toggle.tsx         # Theme toggle button
│       │   ├── about-dialog.tsx         # About modal
│       │   ├── loading-prd.tsx          # Loading state component
│       │   └── ui/                      # ShadCN UI primitives (50+ components)
│       ├── pages/
│       │   ├── home.tsx                 # Landing page with input form & templates
│       │   ├── prds.tsx                 # PRD library
│       │   ├── compare-prds.tsx         # Side-by-side PRD comparison
│       │   ├── templates.tsx            # Custom template management
│       │   ├── tool-pages.tsx           # All 5 AI tool pages
│       │   ├── tool-results.tsx         # Tool results library
│       │   ├── tool-result-detail.tsx   # Individual tool result viewer
│       │   ├── shared-prd.tsx           # Read-only shared PRD view
│       │   ├── shared-tool-result.tsx   # Read-only shared tool result view
│       │   └── not-found.tsx            # 404 page
│       ├── hooks/
│       │   ├── use-toast.ts             # Toast notifications
│       │   └── use-mobile.tsx           # Mobile detection
│       └── lib/
│           ├── queryClient.ts           # TanStack Query config & API helpers
│           └── utils.ts                 # Utility functions
│
├── server/                        # Backend
│   ├── index.ts                   # Express app setup and server startup
│   ├── routes.ts                  # All API endpoints
│   ├── openai.ts                  # AI generation functions (7 tools)
│   ├── storage.ts                 # Database CRUD operations
│   ├── db.ts                      # PostgreSQL connection & Drizzle setup
│   ├── seed.ts                    # Sample data seeding
│   ├── static.ts                  # Static file serving (production)
│   └── vite.ts                    # Vite dev server integration
│
├── shared/                        # Shared between client and server
│   └── schema.ts                  # Drizzle ORM table definitions & Zod schemas
│
├── migrations/                    # Auto-generated Drizzle migrations
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
├── components.json                # ShadCN UI config
└── README.md
```

---

## How It Works

### PRD Generation
1. User enters a product idea in the input form.
2. Frontend sends the idea to `POST /api/prds/generate`.
3. Backend injects the idea into a structured prompt and calls the AI model.
4. The AI generates a complete PRD with all sections.
5. The PRD is saved to PostgreSQL and displayed in the UI.
6. User can edit sections inline, request AI rewrites, view version history, export, or share.

### AI Tool Workflow
1. User navigates to a tool page (e.g., User Story Generator).
2. User provides the relevant input (feature description, problem statement, backlog, etc.).
3. Backend processes the input through a tool-specific AI prompt.
4. Results are saved and displayed with options to edit, version, and share.

---

## API Endpoints

### PRD Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prds` | List all PRDs |
| GET | `/api/prds/:id` | Get a single PRD |
| POST | `/api/prds/generate` | Generate a new PRD |
| PATCH | `/api/prds/:id` | Update a PRD (creates version snapshot) |
| DELETE | `/api/prds/:id` | Delete a PRD |
| POST | `/api/prds/:id/share` | Generate a shareable link |
| GET | `/api/shared/:shareId` | Get a shared PRD (read-only) |
| GET | `/api/prds/:id/versions` | Get version history |
| POST | `/api/prds/:id/versions/:versionId/restore` | Restore a version |

### AI Tool Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tools/user-stories` | Generate user stories (stateless) |
| POST | `/api/tools/refine-problem` | Refine a problem statement (stateless) |
| POST | `/api/tools/prioritize-features` | Prioritize features via RICE (stateless) |
| POST | `/api/tools/plan-sprint` | Generate a sprint plan (stateless) |
| POST | `/api/tools/interview-prep` | Prepare interview answers (stateless) |
| POST | `/api/tools/user-stories/generate` | Generate user stories and save to DB |
| POST | `/api/tools/refine-problem/generate` | Refine a problem and save to DB |
| POST | `/api/tools/prioritize-features/generate` | Prioritize features and save to DB |
| POST | `/api/tools/plan-sprint/generate` | Generate a sprint plan and save to DB |
| POST | `/api/tools/interview-prep/generate` | Prepare interview answers and save to DB |
| POST | `/api/tools/rewrite-section` | AI rewrite of a PRD section |

### Tool Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tool-results` | List all tool results (optional `?toolType=` filter) |
| GET | `/api/tool-results/:id` | Get a single tool result |
| PATCH | `/api/tool-results/:id` | Update a tool result (creates version snapshot) |
| DELETE | `/api/tool-results/:id` | Delete a tool result |
| POST | `/api/tool-results/:id/share` | Generate a shareable link |
| GET | `/api/shared/tool/:shareId` | Get a shared tool result (read-only) |
| GET | `/api/tool-results/:id/versions` | Get version history |
| POST | `/api/tool-results/:id/versions/:versionId/restore` | Restore a version |

### Templates, Analytics & Models
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List custom templates |
| POST | `/api/templates` | Create a template |
| DELETE | `/api/templates/:id` | Delete a template |
| POST | `/api/analytics/export` | Log an export event |
| GET | `/api/analytics/summary` | Usage analytics summary |
| GET | `/api/models` | List available AI models |

---

## Screenshots

<img width="1792" height="1004" alt="Screenshot 2026-02-10 at 1 32 45 PM" src="https://github.com/user-attachments/assets/514f6f36-aa5a-443f-b1f4-385e7552e30d" />

<img width="1797" height="1036" alt="Screenshot 2026-02-10 at 1 33 12 PM" src="https://github.com/user-attachments/assets/55baa881-6ab9-4eff-afdb-3e921d6ee25a" />

<img width="1794" height="1035" alt="Screenshot 2026-02-10 at 1 58 39 PM" src="https://github.com/user-attachments/assets/d3ccefc1-9050-4396-b3db-8dd622741826" />

<img width="1796" height="1039" alt="Screenshot 2026-02-10 at 1 59 31 PM" src="https://github.com/user-attachments/assets/547eb970-b036-4d6e-ac74-cdb88bf69e0c" />

---

## Setup & Development

### Prerequisites
- Node.js 18+
- PostgreSQL database
- `DATABASE_URL` environment variable
- OpenAI API credentials (configured via Replit AI services)

### Development
```bash
npm install
npm run db:push    # Apply database migrations
npm run dev        # Start dev server on port 5000
```

### Production
```bash
npm run build      # Build client + bundle server
npm start          # Run production server on port 5000
```

### Type Checking
```bash
npm run check      # Run TypeScript compiler
```

---

## Future Enhancements

- Multi-model support — choose between different AI models *(coming soon)*
- Collaborative editing — multi-user real-time editing *(planned)*
- User accounts with cloud sync *(planned)*
- Export to Notion / Jira *(planned)*
- Multi-language support *(planned)*

---

## Development Approach
This project was built using Replit and Claude, combining traditional development with AI-assisted coding workflows. Leveraging Replit for hosting and rapid prototyping, and Claude for AI-assisted development, enabled focus on product strategy, UX, and prompt engineering while maintaining full ownership of the architecture and implementation.

---

## Author

Built by **Vidyullatha KS** — Product Manager specializing in AI-Powered Analytics & Data-Driven Solutions.
This project showcases practical AI product development, prompt engineering, and full-stack deployment.

---
