# Mini AI HR

**Smart HR. Simple Management.**

Mini AI HR is a full-stack HR management system built with Next.js 16. It lets HR admins manage employee records through a clean dashboard and interact with their data via an AI-powered chat assistant backed by Google Gemini.

---

## Features

- **Authentication** — Secure sign-in/sign-up via Supabase Auth
- **Dashboard** — Real-time stats (total, active, inactive employees, departments) with a recent-employees table
- **Employee Management** — Full CRUD: list with search/filter, add, view profile, edit, and deactivate
- **AI Summary Generation** — Generate a professional profile summary for any employee with one click (Gemini)
- **AI HR Chat Assistant** — Conversational interface to list, create, update, and deactivate employees using natural language (Gemini with function calling)
- **Dark Mode** — System-aware theme toggle powered by `next-themes`

---

## Tech Stack

| Layer        | Technology                                                |
| ------------ | --------------------------------------------------------- |
| Framework    | Next.js 16.2.6 (App Router)                               |
| Language     | TypeScript                                                |
| Styling      | TailwindCSS v4 + shadcn/ui (Radix UI)                     |
| Database ORM | Prisma 7.8.0 (`@prisma/adapter-pg`)                       |
| Auth + DB    | Supabase (`@supabase/ssr`)                                |
| AI           | Google Gemini `gemini-2.0-flash-lite` via `@google/genai` |
| Icons        | lucide-react                                              |
| Toasts       | sonner                                                    |

---

## Prerequisites

- Node.js 20.9+
- A [Supabase](https://supabase.com) project (for Auth and the PostgreSQL database)
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (for Gemini features)

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd mini-ai-hr
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
DATABASE_URL=your_supabase_postgres_connection_string
GEMINI_API_KEY=your_google_ai_studio_api_key
```

> **Note:** The AI features (chat assistant and summary generation) are fully implemented but currently non-functional due to a Gemini API key free-tier limitation. All code and logic is in place and will work once a valid key with quota is provided from [Google AI Studio](https://aistudio.google.com/apikey).

### 3. Run database migrations

```bash
npm run migrate
```

This generates the Prisma client and applies all migrations to your database.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```text
mini-ai-hr/
├── actions/              # Server actions (employees.ts, users.ts)
├── app/
│   ├── api/
│   │   └── chat/         # POST /api/chat — AI HR chat endpoint
│   ├── dashboard/
│   │   ├── chat/         # AI Assistant page
│   │   ├── employees/    # Employee list, detail, add, edit pages
│   │   └── page.tsx      # Dashboard overview
│   └── login/            # Auth page
├── components/           # Shared UI components + shadcn/ui
├── db/
│   ├── schema.prisma     # Prisma schema (Employee, User, ChatMessage)
│   ├── prisma.ts         # PrismaClient singleton
│   └── migrations/       # Prisma migration history
├── lib/
│   └── supabase/         # Supabase client helpers (browser + server)
├── providers/            # ThemeProvider
└── proxy.ts              # Next.js 16 middleware (auth guard)
```

---

## Database Schema

```prisma
model Employee {
  id             String         @id @default(uuid())
  name           String
  email          String         @unique
  jobTitle       String
  department     String
  employmentType EmploymentType  // FULL_TIME | PART_TIME | CONTRACT | INTERN
  joiningDate    DateTime
  status         EmployeeStatus  // ACTIVE | INACTIVE
  summary        String?         // AI-generated profile summary
}

model User {
  id       String        @id @default(uuid())
  email    String        @unique
  messages ChatMessage[]
}

model ChatMessage {
  id      String  @id @default(uuid())
  userId  String
  role    String  // "user" | "assistant"
  content String
  action  String? // mutating action label, e.g. "create_employee"
}
```

---

## AI Features

### Generate Summary

On any employee's profile page, clicking **Generate Summary** calls `POST /api/generate-summary` which sends the employee's details to Gemini and saves the returned summary back to the database.

### AI HR Chat

The `/dashboard/chat` page connects to `POST /api/chat`. The endpoint:

1. Loads the last 20 messages from the database as conversation history
2. Creates a Gemini chat session with function-calling tools
3. Runs an agentic loop — executing tool calls until Gemini returns a final text reply
4. Persists both the user message and assistant reply to the database

**Available tools:** `list_employees`, `find_employee_by_name`, `create_employee`, `update_employee`, `deactivate_employee`

**Example prompts:**

- _"List all active employees"_
- _"Create a new employee: Jane Doe, jane@company.com, Software Engineer, Engineering, full-time, joining 2026-06-01"_
- _"Update John's job title to Senior Developer"_
- _"Deactivate Maria"_

---

## Available Scripts

| Script            | Description                             |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Start the development server            |
| `npm run build`   | Build for production                    |
| `npm run start`   | Start the production server             |
| `npm run lint`    | Run ESLint                              |
| `npm run migrate` | Generate Prisma client + run migrations |
