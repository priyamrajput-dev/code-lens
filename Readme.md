# 🔍 CodeLens

> **Intelligent, Context-Aware AI Code Reviews for GitHub Pull Requests powered by RAG and Pinecone.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.x-black?style=flat-square&logo=express)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-000000?style=flat-square&logo=pinecone)](https://www.pinecone.io/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?style=flat-square&logo=drizzle)](https://orm.drizzle.team/)
[![Better Auth](https://img.shields.io/badge/Auth-Better_Auth-blueviolet?style=flat-square)](https://better-auth.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Review Rubric & Output](#-review-rubric--output)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Repository Setup](#repository-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [GitHub App Configuration](#github-app-configuration)
  - [Pinecone Vector DB Setup](#pinecone-vector-db-setup)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**CodeLens** is a developer-first, autonomous AI code review platform that acts as a 24/7 senior engineer on your engineering team.

Traditional AI code reviewers only inspect the isolated diff provided in a pull request, missing the bigger picture. **CodeLens solves this by using Retrieval-Augmented Generation (RAG)**:

1. It synchronizes and embeds your entire codebase into a **Pinecone vector database**.
2. When a GitHub pull request is opened or updated, CodeLens analyzes the git patch and queries Pinecone for relevant codebase context, types, functions, and architecture patterns.
3. It generates constructive, highly contextual code reviews and posts them directly as GitHub PR comments.
4. Developers track repositories, sync statuses, usage, and subscriptions via a sleek **React 19 + Tailwind CSS** dashboard.

---

## ✨ Key Features

- **⚡ Automated GitHub Webhook Reviews**: Triggers instantly on `pull_request.opened` and `pull_request.synchronize` events.
- **🧠 Codebase Intelligence (Pinecone RAG)**: Ingests and chunks source files across languages (`.ts`, `.tsx`, `.py`, `.go`, `.rs`, `.java`, etc.), enabling the AI to cite existing codebase patterns and avoid redundant implementations.
- **🎯 6-Pillar Review Rubric**:
  - **Correctness**: Catches logic errors, off-by-one errors, and bad assumptions.
  - **Security**: Flags injection risks, exposed credentials, unsafe deserialization, and authentication flaws.
  - **Performance**: Detects N+1 queries, memory leaks, unindexed queries, and heavy synchronous loops.
  - **Reliability**: Surfaces missing error handling, unhandled edge cases, and race conditions.
  - **Readability**: Suggests clearer naming, code formatting, and explanatory documentation.
  - **Maintainability**: Identifies tight coupling, duplicate logic (DRY), and violations of SOLID principles.
- **💬 GitHub-Native PR Comments**: Formats actionable reviews into clear markdown sections:
  - `✅ What looks good`
  - `⚠️ Suggestions` (non-blocking)
  - `🚨 Issues` (critical bugs or security flaws)
- **📊 Modern Web Dashboard**:
  - GitHub App connection and organization linking.
  - Repository management with real-time codebase sync status (`pending`, `syncing`, `synced`, `failed`).
  - Monthly review usage tracker and automated quota enforcement.
- **💳 Tiered Billing (Razorpay Integration)**:
  - **Free Tier**: Includes 5 automated PR reviews per month.
  - **Pro Tier**: Unlimited reviews with priority processing, powered by recurring Razorpay subscriptions.
- **🔐 Secure Authentication**: Integrated with **Better-Auth** for seamless GitHub OAuth authentication and session management.

---

## 🔄 How It Works

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant GH as GitHub (Repository & PR)
    participant CL as CodeLens Server (Express 5)
    participant PC as Pinecone (Vector Store)
    participant AI as OpenRouter (Vercel AI SDK)
    participant DB as PostgreSQL (Drizzle ORM)

    Dev->>GH: Opens or updates Pull Request
    GH->>CL: Webhook: pull_request event
    CL->>DB: Record PR in database & verify quota
    CL->>GH: Fetch PR changed files & unified diffs (Octokit)
    CL->>PC: Query codebase namespace for relevant context
    PC-->>CL: Return matching codebase snippets
    CL->>AI: Generate review (Diff + RAG Context + Rubric)
    AI-->>CL: Structured Markdown Review
    CL->>GH: Post review comment to GitHub PR
    CL->>DB: Update PR status to "reviewed"
```

---

## 🏗️ Architecture

CodeLens is organized as a full-stack monorepo:

```
code-lens/
├── client/                 # React 19 + Vite Frontend SPA
│   ├── src/
│   │   ├── components/     # UI design system (Shadcn UI & Base UI)
│   │   ├── features/       # Feature modules (auth, dashboard, repos, github, settings)
│   │   ├── hooks/          # React hooks
│   │   ├── lib/            # API clients, Better-Auth client, utils
│   │   ├── stores/         # State management (Zustand)
│   │   └── types/          # TypeScript definitions
│   └── vite.config.ts      # Vite bundler & API reverse proxy configuration
│
└── server/                 # Express 5 + Bun / Node.js Backend API
    ├── src/
    │   ├── common/         # Global middleware, errors, env schema (Zod)
    │   ├── db/             # Drizzle ORM schemas (PostgreSQL) & migrations
    │   ├── lib/            # External integrations (AI SDK, GitHub App, Pinecone, Razorpay)
    │   ├── modules/        # Domain-driven feature modules:
    │   │   ├── billing/    # Razorpay subscriptions, usage limits, webhooks
    │   │   ├── github/     # GitHub App installation, status, repo listing
    │   │   ├── repo-sync/  # Git tree parsing, chunking, Pinecone vector indexing
    │   │   ├── reviews/    # Webhook handling, RAG prompt assembly, AI review generation
    │   │   └── settings/   # User profile, usage stats, settings aggregation
    │   └── server.ts       # Server bootstrapper & DB connection
    └── drizzle.config.ts   # Drizzle Kit configuration
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Shadcn UI, Radix / Base UI, Phosphor & Lucide Icons |
| **State & Data** | TanStack React Query v5, Zustand, React Router v7 |
| **Backend API** | Node.js / Bun, Express 5, TypeScript |
| **Authentication**| Better-Auth with GitHub OAuth provider |
| **Database & ORM**| PostgreSQL, Drizzle ORM, Drizzle Kit |
| **AI & Vector DB**| Vercel AI SDK (`ai`), OpenRouter API (`@openrouter/ai-sdk-provider`), Pinecone Vector DB |
| **Developer APIs**| Octokit (GitHub REST API & GitHub Apps), Razorpay SDK |
| **Validation** | Zod |

---

## 📋 Review Rubric & Output

CodeLens evaluates changes against strict engineering criteria:

```markdown
### ✅ What looks good
- Clean modularization in `reviews.service.ts` separating chunking logic from Octokit calls.
- Proper use of transactions when updating billing subscription status.

### ⚠️ Suggestions
- In `repo-sync.service.ts`, consider adding a retry mechanism with exponential backoff for Pinecone batch upserts.

### 🚨 Issues
- **Potential SQL Injection** in query builder parameter concatenation on line 42. Use parameterized queries or Drizzle ORM helpers instead.
- **Missing Null Check**: `account.login` can be undefined if an organization installation slug is returned.
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Bun](https://bun.sh/) (recommended) or [Node.js](https://nodejs.org/) (v20+)
- [PostgreSQL](https://www.postgresql.org/) database instance
- [GitHub Account](https://github.com/) to create a GitHub App & OAuth App
- [OpenRouter Account](https://openrouter.ai/) for LLM inference
- [Pinecone Account](https://www.pinecone.io/) for vector indexing
- [Razorpay Account](https://razorpay.com/) (optional, for subscription billing)

---

### Repository Setup

Clone the repository:

```bash
git clone https://github.com/priyamrajput-dev/code-lens.git
cd code-lens
```

---

### Backend Setup

1. Navigate to the server folder and install dependencies:
   ```bash
   cd server
   bun install # or npm install
   ```

2. Create a `.env` file inside `server/`:
   ```bash
   cp .env.example .env # or create manually based on below table
   ```

3. Run database migrations using Drizzle:
   ```bash
   bun run db:generate
   bun run db:migrate
   ```

4. Start the server in development mode:
   ```bash
   bun run dev
   # Server runs at http://localhost:8000
   ```

---

### Frontend Setup

1. Navigate to the client folder and install dependencies:
   ```bash
   cd ../client
   bun install # or npm install
   ```

2. Start the Vite development server:
   ```bash
   bun run dev
   # Client runs at http://localhost:3000
   ```

3. Open `http://localhost:3000` in your browser.

---

### GitHub App Configuration

To enable automated PR reviews:

1. Create a new **GitHub App** under your GitHub account or organization:
   - **Homepage URL**: `http://localhost:3000`
   - **Callback URL**: `http://localhost:8000/api/auth/callback/github`
   - **Webhook URL**: Your public server URL (e.g. via ngrok: `https://your-domain.ngrok-free.dev/api/reviews/webhook`)
   - **Webhook Secret**: Choose a strong secret and set `GITHUB_WEBHOOK_SECRET`.
2. Configure **Repository Permissions**:
   - **Pull requests**: Read & write (to read diffs and post review comments)
   - **Contents**: Read-only (to fetch repository file trees and blobs for RAG sync)
   - **Issues**: Read & write (to post issue comments)
   - **Metadata**: Read-only
3. Subscribe to **Events**:
   - `Pull request` (open, synchronize)
4. Generate and download a **Private Key (`.pem`)**, then set `GITHUB_PRIVATE_KEY` in `server/.env`.
5. Note your **App ID** and **App Slug** and add them to your environment variables.

---

### Pinecone Vector DB Setup

1. Create an index in the Pinecone console:
   - **Index Name**: `code-lens-index`
   - **Dimensions**: `1536` (or matched to your chosen embedding model)
   - **Metric**: `cosine`
2. Add `PINECONE_API_KEY` and `PINECONE_INDEX` to `server/.env`.

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable | Description | Required | Example / Default |
| :--- | :--- | :---: | :--- |
| `PORT` | Backend server port | No | `8000` |
| `CLIENT_URL` | Frontend URL for CORS | Yes | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@localhost:5432/codelens` |
| `BETTER_AUTH_SECRET` | Secret key for session encryption | Yes | Random 32+ character string |
| `BETTER_AUTH_URL` | Base URL for Better-Auth | Yes | `http://localhost:8000` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | Yes | `Iv1.xxxxxxxxxxxx` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | Yes | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `GITHUB_APP_ID` | GitHub App ID | Yes | `123456` |
| `GITHUB_APP_SLUG` | GitHub App Slug | Yes | `codelens-ai-reviewer` |
| `GITHUB_PRIVATE_KEY` | GitHub App RSA Private Key | Yes | `-----BEGIN RSA PRIVATE KEY-----\n...` |
| `GITHUB_WEBHOOK_SECRET`| Secret used to verify GitHub webhooks | Yes | `your_webhook_secret` |
| `OPENROUTER_API_KEY` | OpenRouter API Key for AI reviews | Yes | `sk-or-v1-...` |
| `PINECONE_API_KEY` | Pinecone API key for vector storage | Yes | `pcsk_...` |
| `PINECONE_INDEX` | Pinecone index name | No | `code-lens-index` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | No | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET`| Razorpay Key Secret | No | `xxxxxxxxxxxx` |
| `RAZORPAY_WEBHOOK_SECRET`| Webhook secret for Razorpay | No | `xxxxxxxxxxxx` |
| `RAZORPAY_PRO_PLAN_ID`| Razorpay Plan ID for Pro subscription| No | `plan_xxxxxxxx` |

### Client (`client/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_SERVER_URL` | Backend server base URL | `http://localhost:8080` (falls back to Vite proxy) |

---

## 🔌 API Endpoints

### 🔐 Authentication (`/api/auth/*`)
- Better-Auth managed routes for GitHub OAuth login, user sessions, and token refresh.

### 🐙 GitHub (`/api/github`)
- `GET /api/github/status` — Returns current GitHub App installation status and install URL.
- `POST /api/github/installation` — Links a GitHub App installation to the authenticated user.
- `GET /api/github/repos` — Lists repositories accessible to the installation.

### 🔄 Repository Sync (`/api/repo-sync`)
- `POST /api/repo-sync` — Triggers background codebase tree ingestion and Pinecone vector indexing.
- `GET /api/repo-sync/status?repos=...` — Returns indexing status for multiple repositories.

### 📝 Reviews (`/api/reviews`)
- `POST /api/reviews/webhook` — GitHub App Webhook endpoint handling PR triggers.
- `GET /api/reviews?repo=...` — Fetches past review history for a repository.
- `POST /api/reviews/trigger` — Manually trigger review for a specific PR.

### 💳 Billing (`/api/billing`)
- `GET /api/billing/subscription` — Returns current plan, status, and renewal date.
- `GET /api/billing/usage` — Returns monthly review quota and current usage count.
- `POST /api/billing/create-subscription` — Creates a Razorpay recurring subscription.
- `POST /api/billing/cancel-subscription` — Cancels active Pro subscription.
- `POST /api/billing/webhook` — Verifies Razorpay subscription lifecycle events.

### ⚙️ Settings (`/api/settings`)
- `GET /api/settings` — Returns consolidated user profile, subscription, usage, and GitHub connection status.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
