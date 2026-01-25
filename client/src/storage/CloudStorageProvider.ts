import client, {
    fetchRoutines,
    fetchRoutineById,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    fetchWorkouts,
    fetchWorkoutById,
    saveWorkout,
    fetchAnalytics,
    fetchExerciseHistory,
    fetchStreakData,
} from '../api/client';
import { StorageProvider } from './types';
import { Routine, Workout, AnalyticsStats, ExerciseHistory, StreakData } from '../api/client';

/**
 * Cloud storage provider using API calls
 * Requires authentication token
 */
export class CloudStorageProvider implements StorageProvider {
    private authToken: string;

    constructor(authToken: string) {
        this.authToken = authToken;
        // Set authorization header for all requests
        client.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    }

    // ===== ROUTINES =====

    async getRoutines(): Promise<Routine[]> {
        return await fetchRoutines();
    }

    async getRoutine(id: string): Promise<Routine> {
        return await fetchRoutineById(id);
    }

    async createRoutine(routine: Omit<Routine, 'id'>): Promise<Routine> {
        return await createRoutine(routine);
    }

    async updateRoutine(id: string, routine: Omit<Routine, 'id'>): Promise<Routine> {
        return await updateRoutine(id, routine);
    }

    async deleteRoutine(id: string): Promise<void> {
        await deleteRoutine(id);
    }

    // ===== WORKOUTS =====

    async getWorkouts(): Promise<Workout[]> {
        return await fetchWorkouts();
    }

    async getWorkout(id: string): Promise<Workout> {
        return await fetchWorkoutById(id);
    }

    async saveWorkout(workout: Omit<Workout, 'id'>): Promise<Workout> {
        return await saveWorkout(workout);
    }

    // ===== ANALYTICS =====

    async getAnalytics(timeRange: string): Promise<AnalyticsStats> {
        return await fetchAnalytics(timeRange);
    }

    async getExerciseHistory(exerciseName: string, timeRange: string): Promise<ExerciseHistory> {
        return await fetchExerciseHistory(exerciseName, timeRange);
    }

    async getStreakData(weeklyGoal: number): Promise<StreakData> {
        return await fetchStreakData(weeklyGoal);
    }
}
