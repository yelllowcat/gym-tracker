import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageProvider } from './types';
import { Routine, Workout, AnalyticsStats, ExerciseHistory, StreakData, CalendarDay, WeekData, WorkoutDataPoint, PersonalRecord } from '../api/client';

const STORAGE_KEYS = {
    ROUTINES: '@gym_tracker_routines',
    WORKOUTS: '@gym_tracker_workouts',
};

/**
 * Local storage provider using AsyncStorage
 * Stores all data on the device
 */
export class LocalStorageProvider implements StorageProvider {
    // Helper to generate UUID
    private generateId(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // ===== ROUTINES =====

    async getRoutines(): Promise<Routine[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.ROUTINES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting routines from AsyncStorage:', error);
            return [];
        }
    }

    async getRoutine(id: string): Promise<Routine> {
        const routines = await this.getRoutines();
        const routine = routines.find(r => r.id === id);
        if (!routine) {
            throw new Error('Routine not found');
        }
        return routine;
    }

    async createRoutine(routine: Omit<Routine, 'id'>): Promise<Routine> {
        const routines = await this.getRoutines();
        const newRoutine: Routine = {
            ...routine,
            id: this.generateId(),
        };
        routines.push(newRoutine);
        await AsyncStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
        return newRoutine;
    }

    async updateRoutine(id: string, routine: Omit<Routine, 'id'>): Promise<Routine> {
        const routines = await this.getRoutines();
        const index = routines.findIndex(r => r.id === id);
        if (index === -1) {
            throw new Error('Routine not found');
        }
        const updatedRoutine: Routine = { ...routine, id };
        routines[index] = updatedRoutine;
        await AsyncStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
        return updatedRoutine;
    }

    async deleteRoutine(id: string): Promise<void> {
        const routines = await this.getRoutines();
        const filtered = routines.filter(r => r.id !== id);
        await AsyncStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(filtered));
    }

    // ===== WORKOUTS =====

    async getWorkouts(): Promise<Workout[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting workouts from AsyncStorage:', error);
            return [];
        }
    }

    async getWorkout(id: string): Promise<Workout> {
        const workouts = await this.getWorkouts();
        const workout = workouts.find(w => w.id === id);
        if (!workout) {
            throw new Error('Workout not found');
        }
        return workout;
    }

    async saveWorkout(workout: Omit<Workout, 'id'>): Promise<Workout> {
        const workouts = await this.getWorkouts();
        const newWorkout: Workout = {
            ...workout,
            id: this.generateId(),
        };
        workouts.push(newWorkout);
        await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
        return newWorkout;
    }

    // ===== ANALYTICS =====
    // Compute analytics locally from stored workouts

    async getAnalytics(timeRange: string): Promise<AnalyticsStats> {
        const workouts = await this.getWorkouts();
        const startDate = this.getTimeRangeDate(timeRange);

        // Filter workouts by time range
        const filteredWorkouts = workouts.filter(w =>
            new Date(w.startedAt) >= startDate
        );

        // Calculate total workouts
        const totalWorkouts = filteredWorkouts.length;

        // Calculate average duration
        const durationsInMinutes = filteredWorkouts
            .filter(w => w.endedAt)
            .map(w => {
                const duration = new Date(w.endedAt!).getTime() - new Date(w.startedAt).getTime();
                return duration / 60000; // Convert to minutes
            });
        const avgDuration = durationsInMinutes.length > 0
            ? Math.round(durationsInMinutes.reduce((sum, d) => sum + d, 0) / durationsInMinutes.length)
            : 0;

        // Calculate total volume and exercise stats
        let totalVolume = 0;
        const exerciseStatsMap = new Map<string, {
            exerciseName: string;
            totalSets: number;
            maxWeight: number;
            totalWeight: number;
            weightCount: number;
            lastPerformed: Date;
        }>();

        filteredWorkouts.forEach(workout => {
            workout.exercises?.forEach(exercise => {
                exercise.sets?.forEach(set => {
                    totalVolume += set.weight * set.reps;

                    const existing = exerciseStatsMap.get(exercise.name);
                    if (existing) {
                        existing.totalSets += 1;
                        existing.maxWeight = Math.max(existing.maxWeight, set.weight);
                        existing.totalWeight += set.weight;
                        existing.weightCount += 1;
                        existing.lastPerformed = new Date(workout.startedAt) > existing.lastPerformed
                            ? new Date(workout.startedAt)
                            : existing.lastPerformed;
                    } else {
                        exerciseStatsMap.set(exercise.name, {
                            exerciseName: exercise.name,
                            totalSets: 1,
                            maxWeight: set.weight,
                            totalWeight: set.weight,
                            weightCount: 1,
                            lastPerformed: new Date(workout.startedAt),
                        });
                    }
                });
            });
        });

        const exerciseStats = Array.from(exerciseStatsMap.values()).map(stat => ({
            exerciseName: stat.exerciseName,
            totalSets: stat.totalSets,
            maxWeight: stat.maxWeight,
            avgWeight: Math.round(stat.totalWeight / stat.weightCount),
            lastPerformed: stat.lastPerformed.toISOString(),
        }));

        // Calculate workouts by week
        const workoutsByWeekMap = new Map<string, number>();
        filteredWorkouts.forEach(workout => {
            const week = this.getWeekNumber(new Date(workout.startedAt));
            workoutsByWeekMap.set(week, (workoutsByWeekMap.get(week) || 0) + 1);
        });

        const workoutsByWeek = Array.from(workoutsByWeekMap.entries()).map(([week, count]) => ({
            week,
            count,
        }));

        return {
            totalWorkouts,
            avgDuration,
            totalVolume: Math.round(totalVolume),
            workoutsByWeek,
            exerciseStats: exerciseStats.sort((a, b) => b.totalSets - a.totalSets),
        };
    }

    async getExerciseHistory(exerciseName: string, timeRange: string): Promise<ExerciseHistory> {
        const workouts = await this.getWorkouts();
        const startDate = this.getTimeRangeDate(timeRange);

        // Filter workouts containing this exercise
        const filteredWorkouts = workouts.filter(w =>
            new Date(w.startedAt) >= startDate &&
            w.exercises?.some(e => e.name === exerciseName)
        );

        // Build history
        const history: WorkoutDataPoint[] = filteredWorkouts.map(workout => {
            const exercise = workout.exercises?.find(e => e.name === exerciseName);
            if (!exercise || !exercise.sets) {
                return null;
            }

            const weights = exercise.sets.map(s => s.weight);
            const maxWeight = Math.max(...weights);
            const avgWeight = Math.round(weights.reduce((sum, w) => sum + w, 0) / weights.length);
            const totalReps = exercise.sets.reduce((sum, s) => sum + s.reps, 0);

            return {
                date: workout.startedAt,
                workoutId: workout.id,
                maxWeight,
                avgWeight,
                totalReps,
                totalSets: exercise.sets.length,
                sets: exercise.sets.map(s => ({
                    weight: s.weight,
                    reps: s.reps,
                    rir: s.rir,
                })),
            };
        }).filter(Boolean) as WorkoutDataPoint[];

        // Find personal record
        let personalRecord: PersonalRecord | null = null;
        if (history.length > 0) {
            const prEntry = history.reduce((max, entry) =>
                entry.maxWeight > max.maxWeight ? entry : max
            );
            const prSet = prEntry.sets.reduce((max, set) =>
                set.weight > max.weight ? set : max
            );
            personalRecord = {
                weight: prSet.weight,
                reps: prSet.reps,
                date: prEntry.date,
                workoutId: prEntry.workoutId,
            };
        }

        return {
            exerciseName,
            history,
            personalRecord,
        };
    }

    async getStreakData(weeklyGoal: number): Promise<StreakData> {
        const workouts = await this.getWorkouts();

        // Only count completed workouts
        const completedWorkouts = workouts.filter(w => w.endedAt);

        if (completedWorkouts.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                weeklyGoal,
                currentWeekProgress: 0,
                calendarData: [],
                weeklyHistory: [],
            };
        }

        // Group workouts by week
        const weeklyMap = new Map<string, Workout[]>();
        completedWorkouts.forEach(workout => {
            const weekStart = this.getWeekStartDate(new Date(workout.startedAt));
            const weekKey = this.formatDate(weekStart);

            if (!weeklyMap.has(weekKey)) {
                weeklyMap.set(weekKey, []);
            }
            weeklyMap.get(weekKey)!.push(workout);
        });

        // Convert to sorted array
        const weeklyData: WeekData[] = Array.from(weeklyMap.entries())
            .map(([weekStartDate, workouts]) => ({
                weekStartDate,
                workoutCount: workouts.length,
                metGoal: workouts.length >= weeklyGoal,
            }))
            .sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));

        // Calculate current streak
        let currentStreak = 0;
        for (const week of weeklyData) {
            if (week.metGoal) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 0;
        for (const week of [...weeklyData].reverse()) {
            if (week.metGoal) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        }

        // Get current week progress
        const now = new Date();
        const currentWeekStart = this.getWeekStartDate(now);
        const currentWeekKey = this.formatDate(currentWeekStart);
        const currentWeekData = weeklyData.find(w => w.weekStartDate === currentWeekKey);
        const currentWeekProgress = currentWeekData ? currentWeekData.workoutCount : 0;

        // Generate calendar data (last 84 days)
        const calendarData: CalendarDay[] = [];
        const daysToShow = 84;
        const startDate = new Date(now.getTime() - (daysToShow - 1) * 24 * 60 * 60 * 1000);

        const dailyMap = new Map<string, number>();
        completedWorkouts.forEach(workout => {
            const dateKey = this.formatDate(new Date(workout.startedAt));
            dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1);
        });

        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const dateKey = this.formatDate(date);
            const workoutCount = dailyMap.get(dateKey) || 0;

            let intensity = 0;
            if (workoutCount === 1) intensity = 1;
            else if (workoutCount === 2) intensity = 2;
            else if (workoutCount === 3) intensity = 3;
            else if (workoutCount >= 4) intensity = 4;

            calendarData.push({
                date: dateKey,
                workoutCount,
                intensity,
            });
        }

        return {
            currentStreak,
            longestStreak,
            weeklyGoal,
            currentWeekProgress,
            calendarData,
            weeklyHistory: weeklyData.reverse().slice(0, 12),
        };
    }

    // ===== HELPER METHODS =====

    private getTimeRangeDate(timeRange: string): Date {
        const now = new Date();
        switch (timeRange) {
            case '7d':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30d':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case '90d':
                return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            case 'all':
            default:
                return new Date(0);
        }
    }

    private getWeekNumber(date: Date): string {
        const onejan = new Date(date.getFullYear(), 0, 1);
        const week = Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
        return `Week ${week}`;
    }

    private getWeekStartDate(date: Date): Date {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    private formatDate(date: Date): string {
        const isoString = date.toISOString();
        return isoString.split('T')[0] || isoString.substring(0, 10);
    }
}
