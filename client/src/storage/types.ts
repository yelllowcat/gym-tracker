import { Routine, Workout, AnalyticsStats, ExerciseHistory, StreakData } from '../api/client';

export type StorageMode = 'local' | 'cloud';

/**
 * Storage provider interface that abstracts local and cloud storage
 */
export interface StorageProvider {
    // Routines
    getRoutines(): Promise<Routine[]>;
    getRoutine(id: string): Promise<Routine>;
    createRoutine(routine: Omit<Routine, 'id'>): Promise<Routine>;
    updateRoutine(id: string, routine: Omit<Routine, 'id'>): Promise<Routine>;
    deleteRoutine(id: string): Promise<void>;

    // Workouts
    getWorkouts(): Promise<Workout[]>;
    getWorkout(id: string): Promise<Workout>;
    saveWorkout(workout: Omit<Workout, 'id'>): Promise<Workout>;

    // Analytics
    getAnalytics(timeRange: string): Promise<AnalyticsStats>;
    getExerciseHistory(exerciseName: string, timeRange: string): Promise<ExerciseHistory>;
    getStreakData(weeklyGoal: number): Promise<StreakData>;
}

/**
 * Storage configuration
 */
export interface StorageConfig {
    mode: StorageMode;
    authToken?: string;
}

/**
 * Sync data structure for migration
 */
export interface SyncData {
    routines: Routine[];
    workouts: Workout[];
}
