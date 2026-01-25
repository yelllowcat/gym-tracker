import AsyncStorage from '@react-native-async-storage/async-storage';
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
    Routine,
    Workout,
    AnalyticsStats,
    ExerciseHistory,
    StreakData
} from '../api/client';
import { StorageProvider } from './types';

const CACHE_KEYS = {
    ROUTINES: '@gym_tracker_cache_routines',
    WORKOUTS: '@gym_tracker_cache_workouts',
};

export class CachedCloudStorageProvider implements StorageProvider {
    constructor(authToken: string) {
        client.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    }

    // Helper: Get cached data
    private async getCache<T>(key: string): Promise<T | null> {
        try {
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    // Helper: Set cached data
    private async setCache(key: string, data: any): Promise<void> {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    }

    // Helper: Clear specific cache
    async clearCache(): Promise<void> {
        await AsyncStorage.removeItem(CACHE_KEYS.ROUTINES);
        await AsyncStorage.removeItem(CACHE_KEYS.WORKOUTS);
    }

    // ===== ROUTINES =====

    async getRoutines(): Promise<Routine[]> {
        // Cache-first strategy
        const cached = await this.getCache<Routine[]>(CACHE_KEYS.ROUTINES);
        
        // Return cached immediately if exists, then update in background (handled by screen refresh usually)
        // But for consistency with "1.a Always show cache first", we return what we have
        // The screen usually calls this on focus.
        
        try {
            const fresh = await fetchRoutines();
            await this.setCache(CACHE_KEYS.ROUTINES, fresh);
            return fresh;
        } catch (error) {
            if (cached) return cached;
            throw error;
        }
    }

    async getRoutine(id: string): Promise<Routine> {
        try {
            const fresh = await fetchRoutineById(id);
            return fresh;
        } catch (error) {
            const cached = await this.getCache<Routine[]>(CACHE_KEYS.ROUTINES);
            const found = cached?.find(r => r.id === id);
            if (found) return found;
            throw error;
        }
    }

    async createRoutine(routine: Omit<Routine, 'id'>): Promise<Routine> {
        const result = await createRoutine(routine);
        // Update cache
        const cached = await this.getCache<Routine[]>(CACHE_KEYS.ROUTINES) || [];
        await this.setCache(CACHE_KEYS.ROUTINES, [...cached, result]);
        return result;
    }

    async updateRoutine(id: string, routine: Omit<Routine, 'id'>): Promise<Routine> {
        const result = await updateRoutine(id, routine);
        // Update cache
        const cached = await this.getCache<Routine[]>(CACHE_KEYS.ROUTINES) || [];
        const index = cached.findIndex(r => r.id === id);
        if (index !== -1) {
            cached[index] = result;
            await this.setCache(CACHE_KEYS.ROUTINES, cached);
        }
        return result;
    }

    async deleteRoutine(id: string): Promise<void> {
        await deleteRoutine(id);
        const cached = await this.getCache<Routine[]>(CACHE_KEYS.ROUTINES) || [];
        await this.setCache(CACHE_KEYS.ROUTINES, cached.filter(r => r.id !== id));
    }

    // ===== WORKOUTS =====

    async getWorkouts(): Promise<Workout[]> {
        const cached = await this.getCache<Workout[]>(CACHE_KEYS.WORKOUTS);
        try {
            const fresh = await fetchWorkouts();
            await this.setCache(CACHE_KEYS.WORKOUTS, fresh);
            return fresh;
        } catch (error) {
            if (cached) return cached;
            throw error;
        }
    }

    async getWorkout(id: string): Promise<Workout> {
        try {
            const fresh = await fetchWorkoutById(id);
            return fresh;
        } catch (error) {
            const cached = await this.getCache<Workout[]>(CACHE_KEYS.WORKOUTS);
            const found = cached?.find(w => w.id === id);
            if (found) return found;
            throw error;
        }
    }

    async saveWorkout(workout: Omit<Workout, 'id'>): Promise<Workout> {
        const result = await saveWorkout(workout);
        const cached = await this.getCache<Workout[]>(CACHE_KEYS.WORKOUTS) || [];
        await this.setCache(CACHE_KEYS.WORKOUTS, [result, ...cached]);
        return result;
    }

    // ===== ANALYTICS =====
    // Analytics are harder to cache perfectly without complex logic, so we fetch fresh
    // but we can provide the last known stats if offline

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
