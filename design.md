# Gym Weight Tracker - Design Document
Date: 2026-01-19
Topic: Full Stack Gym Tracker (Expo + Node/Prisma/Postgres)

## 1. Architecture
*   **Type:** Full Stack Application
*   **Client:** React Native (Expo)
*   **Server:** Node.js (Express)
*   **Database:** PostgreSQL (managed via Prisma)
*   **Language:** TypeScript (Shared types where possible)

## 2. Database Schema (Prisma)

### Routine
*   `id`: UUID
*   `name`: String
*   `createdAt`: DateTime
*   `exercises`: Relation -> RoutineExercise[]

### RoutineExercise
*   `id`: UUID
*   `routineId`: FK -> Routine
*   `name`: String
*   `order`: Int
*   `targetSets`: Int
*   `targetReps`: Int

### Workout
*   `id`: UUID
*   `name`: String (Snapshot of routine name or custom)
*   `startedAt`: DateTime
*   `endedAt`: DateTime?
*   `exercises`: Relation -> WorkoutExercise[]

### WorkoutExercise
*   `id`: UUID
*   `workoutId`: FK -> Workout
*   `name`: String
*   `order`: Int
*   `sets`: Relation -> WorkoutSet[]

### WorkoutSet
*   `id`: UUID
*   `workoutExerciseId`: FK -> WorkoutExercise
*   `weight`: Float
*   `reps`: Int
*   `rir`: Int? (Reps In Reserve)
*   `completed`: Boolean

## 3. API Endpoints (REST)

### Routines (CRUD)
*   `GET /routines` - List all
*   `GET /routines/:id` - Details
*   `POST /routines` - Create
*   `PUT /routines/:id` - Update
*   `DELETE /routines/:id` - Remove

### Workouts (CRUD)
*   `POST /workouts` - Save new session
*   `GET /workouts` - History list
*   `GET /workouts/:id` - Detail view
*   `PUT /workouts/:id` - Edit historical data
*   `DELETE /workouts/:id` - Delete session

### Stats
*   `GET /stats/:exerciseName` - Returns time-series data for charting

## 4. Frontend UI/UX

### Navigation (Tabs)
1.  **Workouts (Home)**
    *   Routine List
    *   Active Workout View (Inputs: Weight, Reps, RIR)
2.  **History**
    *   List of past workouts
    *   Detail/Edit view
3.  **Progress**
    *   Exercise Selector
    *   Charts (Recharts or Victory Native)

### Key Components
*   `RoutineCard`: Displays name + exercise summary
*   `SetInputRow`: Columns for Weight | Reps | RIR | Checkbox
*   `ExerciseChart`: Visualizes progress
