# **IdeaForge — AI PRD Generator**  
Turn raw product ideas into complete, structured Product Requirements Documents (PRDs) with user stories and acceptance criteria.

---

## 📌 **Overview**  
**IdeaForge** is a full‑stack AI-powered application that transforms rough product ideas into polished PRDs. It’s designed for product managers, founders, students, and teams who want to accelerate early‑stage product definition without sacrificing clarity or structure.

Users simply describe their idea, and IdeaForge generates:

- Problem Statement  
- Target Audience  
- Goals & Objectives  
- Key Features  
- Success Metrics  
- Out of Scope  
- Assumptions  
- User Stories with Acceptance Criteria  

The tool is fully deployed and accessible online.

---

## 🎯 **Why This Project Exists**  
Writing PRDs is one of the most time‑consuming parts of product management. IdeaForge helps users:

- Move from idea → structured PRD in seconds  
- Explore multiple product directions quickly  
- Improve clarity before involving engineering  
- Learn how strong PRDs are structured  
- Build confidence in product thinking  

This project also demonstrates practical AI product development, prompt engineering, and full‑stack deployment.

---

## 🧠 **Key Features**

### **AI‑Generated PRDs**
A refined prompt ensures consistent, senior‑PM‑quality PRDs.

### **Saved PRD Library**
Users can generate multiple PRDs and switch between them in the sidebar.

### **Clean, Modern UI**
Built with React + Tailwind + ShadCN components for a polished, SaaS‑like feel.

### **Example Ideas**
Preloaded suggestions help users get started quickly.

### **Real‑Time Rendering**
PRDs appear instantly with structured formatting, icons, and section headers.

### **AI‑Generated Content Warning**
A built‑in disclaimer encourages users to review outputs before sharing.

---

## 🛠️ **Tech Stack**

### **Frontend**
- React + TypeScript  
- Vite  
- TailwindCSS  
- ShadCN UI components  
- Custom hooks (`use-toast`, `use-mobile`)  
- Replit integrations (audio, UI helpers)

### **Backend**
- Node.js + TypeScript  
- Express‑style routing  
- Replit server environment  
- OpenAI/LLM integration (`openai.ts`)  
- Drizzle ORM for structured data  
- SQLite (or Replit DB) for storage

### **Infrastructure**
- Hosted on Replit  
- GitHub for version control  
- Vite for bundling  
- Drizzle for schema + migrations  

---

## 📁 **Project Structure (Accurate to Your Repo)**

```
idea-to-docs/
│
├── client/                     # Frontend assets
│   ├── public/
│   └── replit_integrations/
│
├── src/                        # React application
│   ├── components/             # UI components (ShadCN)
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilities, query client
│   ├── pages/                  # App pages (Home, Not Found)
│   ├── main.tsx                # App entry point
│   └── index.css               # Global styles
│
├── server/                     # Backend logic
│   ├── replit_integrations/    # Replit server helpers
│   ├── batch/                  # Batch processing utilities
│   ├── db.ts                   # Database setup (Drizzle)
│   ├── openai.ts               # LLM integration
│   ├── routes.ts               # API routes
│   └── index.ts                # Server entry point
│
├── shared/                     # Shared models & schemas
│   ├── models/
│   └── schema.ts
│
├── attached_assets/            # Temporary assets (ignored in prod)
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── drizzle.config.ts
├── vite.config.ts
├── README.md
└── .replit
```

---

## 🔧 **How It Works**

1. User enters a product idea in the UI.  
2. Frontend sends the idea to the backend via `/api/generate-prd`.  
3. Backend injects the idea into a structured PRD prompt.  
4. LLM generates a complete PRD.  
5. PRD is saved to the database and displayed in the UI.  
6. User can switch between saved PRDs in the sidebar.

---

## 🖼️ **Screenshots**

<img width="3588" height="2066" alt="image" src="https://github.com/user-attachments/assets/9d154743-e5ab-4458-965d-e824f70e090c" />

<img width="3594" height="2070" alt="image" src="https://github.com/user-attachments/assets/f390edac-6c76-4e80-b9fd-47e9ab352bcf" />

<img width="3594" height="2072" alt="image" src="https://github.com/user-attachments/assets/864dbce7-51db-4277-87b7-0b258b37dd66" />

<img width="3574" height="2062" alt="image" src="https://github.com/user-attachments/assets/f2075c1a-435a-4321-8c23-2f6db6a0139b" />

---

## 📈 **Future Enhancements**

- Export PRD as PDF or Markdown  
- Collaborative editing  
- Version history  
- Custom PRD templates  
- Multi‑model support  
- User accounts + cloud sync  
- Shareable PRD links  

---

## 👤 **Author**

Built by **Vidyullatha**, aspiring AI Product Manager.  
This project showcases practical AI product development, prompt engineering, and full‑stack deployment.

---
