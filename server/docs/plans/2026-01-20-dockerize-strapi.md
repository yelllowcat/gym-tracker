# Dockerize Strapi Backend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Create a production-ready Docker setup for the Strapi backend using multi-stage builds.

**Architecture:**
Use a multi-stage Docker build to minimize image size.
- **Stage 1 (Builder):** Install dependencies (including native build tools), build the Strapi admin panel.
- **Stage 2 (Runner):** Copy built artifacts, install only production dependencies, run the application.
Configure `database.ts` to support Postgres via environment variables (verified as already supported).

**Tech Stack:** Docker, Node.js 20 (Alpine), Strapi v5.

### Task 1: Create Multi-Stage Dockerfile

**Files:**
- Modify: `/home/david/repos/templateClaude/my-store-backend/Dockerfile`

**Step 1: Overwrite Dockerfile with multi-stage content**

```dockerfile
# Stage 1: Builder
FROM node:20-alpine as builder
# Install build dependencies
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine as runner
WORKDIR /app
RUN apk add --no-cache vips-dev
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/favicon.png ./favicon.png
COPY --from=builder /app/public ./public
COPY --from=builder /app ./

ENV NODE_ENV=production
CMD ["npm", "run", "start"]
```

**Step 2: Verify Docker build**

Run: `docker build -t saas-backend /home/david/repos/templateClaude/my-store-backend`
Expected: Success

### Task 2: Create .dockerignore

**Files:**
- Create: `/home/david/repos/templateClaude/my-store-backend/.dockerignore`

**Step 1: Write .dockerignore content**

```text
node_modules
.git
.tmp
build
.env
dist
```

### Task 3: Git Commit

**Files:**
- `my-store-backend/Dockerfile`
- `my-store-backend/.dockerignore`
- `my-store-backend/config/database.ts`

**Step 1: Add files**

Run: `git add my-store-backend/Dockerfile my-store-backend/.dockerignore` (in repo root)

**Step 2: Commit**

Run: `git commit -m "chore: dockerize strapi backend"`
