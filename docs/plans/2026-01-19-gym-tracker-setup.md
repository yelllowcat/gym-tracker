# Gym Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-stack gym workout tracker with React Native (Expo) frontend and Node.js/Prisma/PostgreSQL backend.

**Architecture:** Client-Server. Monorepo-style folder structure (`/server`, `/client`).
**Tech Stack:**
*   **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL.
*   **Frontend:** Expo, React Native, TypeScript, React Navigation, Axios.

## Phase 1: Project Initialization & Backend Setup

### Task 1: Project Structure & Backend Init

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/index.ts`

**Step 1: Create directories**
```bash
mkdir -p server client
```

**Step 2: Initialize Server**
```bash
cd server
npm init -y
npm install express cors dotenv @prisma/client
npm install -D typescript ts-node @types/node @types/express @types/cors prisma nodemon
npx tsc --init
```

**Step 3: Configure TypeScript (`server/tsconfig.json`)**
Ensure `outDir` is `./dist` and `rootDir` is `./src`.

**Step 4: Basic Server Setup (`server/src/index.ts`)**
```typescript
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Step 5: Add scripts to `server/package.json`**
```json
"scripts": {
  "dev": "nodemon src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

**Step 6: Verify Server**
Run `npm run dev` and curl `http://localhost:3000/health`.

### Task 2: Database & Prisma Setup

**Files:**
- Create: `server/prisma/schema.prisma`
- Create: `server/.env`

**Step 1: Init Prisma**
```bash
cd server
npx prisma init
```

**Step 2: Define Schema (`server/prisma/schema.prisma`)**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Routine {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  exercises RoutineExercise[]
}

model RoutineExercise {
  id          String  @id @default(uuid())
  routineId   String
  routine     Routine @relation(fields: [routineId], references: [id])
  name        String
  order       Int
  targetSets  Int
  targetReps  Int
}

model Workout {
  id        String   @id @default(uuid())
  name      String
  startedAt DateTime @default(now())
  endedAt   DateTime?
  exercises WorkoutExercise[]
}

model WorkoutExercise {
  id        String   @id @default(uuid())
  workoutId String
  workout   Workout  @relation(fields: [workoutId], references: [id])
  name      String
  order     Int
  sets      WorkoutSet[]
}

model WorkoutSet {
  id                String          @id @default(uuid())
  workoutExerciseId String
  workoutExercise   WorkoutExercise @relation(fields: [workoutExerciseId], references: [id])
  weight            Float
  reps              Int
  rir               Int?
  completed         Boolean         @default(false)
}
```

**Step 3: Env Setup (`server/.env`)**
Ask user for Postgres credentials or assume local default:
`DATABASE_URL="postgresql://user:password@localhost:5432/gymtracker?schema=public"`

**Step 4: Migration**
```bash
npx prisma migrate dev --name init
```

## Phase 2: Backend API Implementation

### Task 3: Routines API

**Files:**
- Create: `server/src/routes/routines.ts`
- Modify: `server/src/index.ts`

**Step 1: Create Routes (`server/src/routes/routines.ts`)**
Implement GET, POST, PUT, DELETE using `prisma.routine`.
*   GET /: Include `exercises` ordered by `order`.
*   POST /: Create Routine + RoutineExercises in a transaction.

**Step 2: Register Routes in `index.ts`**
`app.use('/routines', routineRoutes);`

**Step 3: Verification**
Use `curl` to create a routine and fetch it.

### Task 4: Workouts API

**Files:**
- Create: `server/src/routes/workouts.ts`
- Modify: `server/src/index.ts`

**Step 1: Create Routes (`server/src/routes/workouts.ts`)**
*   POST /: Create Workout + Exercises + Sets.
*   GET /: List history.
*   GET /:id: Get details.

**Step 2: Register Routes in `index.ts`**
`app.use('/workouts', workoutRoutes);`

## Phase 3: Frontend Setup

### Task 5: Expo Init

**Files:**
- Create: `client/package.json` (via init)

**Step 1: Init Expo**
```bash
npx create-expo-app client --template blank-typescript
```

**Step 2: Install Navigation & UI Deps**
```bash
cd client
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack react-native-screens react-native-safe-area-context axios
```

**Step 3: Basic Navigation Setup (`client/App.tsx`)**
Setup `NavigationContainer` with a Bottom Tab Navigator (Workouts, History, Progress).

## Phase 4: Frontend Implementation

### Task 6: Routine List & Creation (Home Tab)

**Files:**
- Create: `client/src/screens/HomeScreen.tsx`
- Create: `client/src/components/RoutineCard.tsx`
- Create: `client/src/api/client.ts` (Axios instance)

**Step 1: Axios Setup**
Configure base URL to `http://localhost:3000` (or local IP for device testing).

**Step 2: Home Screen**
Fetch routines from API. Render list. Add "Create" button.

### Task 7: Active Workout Mode

**Files:**
- Create: `client/src/screens/ActiveWorkoutScreen.tsx`

**Step 1: UI Layout**
Display exercises. For each exercise, map sets.
Inputs: Weight, Reps, RIR. Checkbox for completion.

**Step 2: Logic**
Local state tracks input. "Finish" button sends POST to `/workouts`.

### Task 8: History & Progress

**Files:**
- Create: `client/src/screens/HistoryScreen.tsx`
- Create: `client/src/screens/ProgressScreen.tsx`

**Step 1: History**
Fetch and list workouts.

**Step 2: Progress**
Simple text list or basic chart of max weight for an exercise.

