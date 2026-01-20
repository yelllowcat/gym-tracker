import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

// Helper function to calculate time range
function getTimeRangeDate(timeRange: string): Date {
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
      return new Date(0); // Beginning of time
  }
}

// Helper function to get week number
function getWeekNumber(date: Date): string {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
  return `Week ${week}`;
}

// GET /analytics/stats - Get overall statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const timeRange = (req.query.timeRange as string) || '30d';
    const startDate = getTimeRangeDate(timeRange);

    // Fetch workouts with all nested data
    const workouts = await prisma.workout.findMany({
      where: {
        startedAt: {
          gte: startDate,
        },
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: {
        startedAt: 'asc',
      },
    });

    // Calculate total workouts
    const totalWorkouts = workouts.length;

    // Calculate average duration
    const durationsInMinutes = workouts
      .filter(w => w.endedAt)
      .map(w => {
        const duration = new Date(w.endedAt!).getTime() - new Date(w.startedAt).getTime();
        return duration / 60000; // Convert to minutes
      });
    const avgDuration = durationsInMinutes.length > 0
      ? Math.round(durationsInMinutes.reduce((sum, d) => sum + d, 0) / durationsInMinutes.length)
      : 0;

    // Calculate total volume (weight × reps)
    let totalVolume = 0;
    const exerciseStatsMap = new Map<string, {
      exerciseName: string;
      totalSets: number;
      maxWeight: number;
      totalWeight: number;
      weightCount: number;
      lastPerformed: Date;
    }>();

    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          totalVolume += set.weight * set.reps;

          // Track exercise stats
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

    // Convert exercise stats map to array
    const exerciseStats = Array.from(exerciseStatsMap.values()).map(stat => ({
      exerciseName: stat.exerciseName,
      totalSets: stat.totalSets,
      maxWeight: stat.maxWeight,
      avgWeight: Math.round(stat.totalWeight / stat.weightCount),
      lastPerformed: stat.lastPerformed,
    }));

    // Calculate workouts by week
    const workoutsByWeekMap = new Map<string, number>();
    workouts.forEach(workout => {
      const week = getWeekNumber(new Date(workout.startedAt));
      workoutsByWeekMap.set(week, (workoutsByWeekMap.get(week) || 0) + 1);
    });

    const workoutsByWeek = Array.from(workoutsByWeekMap.entries()).map(([week, count]) => ({
      week,
      count,
    }));

    res.json({
      totalWorkouts,
      avgDuration,
      totalVolume: Math.round(totalVolume),
      workoutsByWeek,
      exerciseStats: exerciseStats.sort((a, b) => b.totalSets - a.totalSets),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics stats' });
  }
});

// GET /analytics/exercise/:exerciseName - Get exercise history
router.get('/exercise/:exerciseName', async (req: Request, res: Response) => {
  try {
    const { exerciseName } = req.params;
    const timeRange = (req.query.timeRange as string) || '30d';
    const startDate = getTimeRangeDate(timeRange);

    // Fetch workouts containing this exercise
    const workouts = await prisma.workout.findMany({
      where: {
        startedAt: {
          gte: startDate,
        },
        exercises: {
          some: {
            name: exerciseName as string,
          },
        },
      },
      include: {
        exercises: {
          where: {
            name: exerciseName as string,
          },
          include: {
            sets: {
              orderBy: {
                id: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        startedAt: 'asc',
      },
    });

    // Build history
    const history = workouts.map((workout: any) => {
      const exercise = workout.exercises[0]; // Should only be one per workout
      const weights = exercise.sets.map((s: any) => s.weight);
      const maxWeight = Math.max(...weights);
      const avgWeight = Math.round(weights.reduce((sum: number, w: number) => sum + w, 0) / weights.length);
      const totalReps = exercise.sets.reduce((sum: number, s: any) => sum + s.reps, 0);

      return {
        date: workout.startedAt,
        workoutId: workout.id,
        maxWeight,
        avgWeight,
        totalReps,
        totalSets: exercise.sets.length,
        sets: exercise.sets.map((s: any) => ({
          weight: s.weight,
          reps: s.reps,
          rir: s.rir,
        })),
      };
    });

    // Find personal record (max weight across all history)
    let personalRecord = null;
    if (history.length > 0) {
      const prEntry = history.reduce((max, entry) => 
        entry.maxWeight > max.maxWeight ? entry : max
      );
      const prSet = prEntry.sets.reduce((max: any, set: any) => 
        set.weight > max.weight ? set : max
      );
      personalRecord = {
        weight: prSet.weight,
        reps: prSet.reps,
        date: prEntry.date,
        workoutId: prEntry.workoutId,
      };
    }

    res.json({
      exerciseName,
      history,
      personalRecord,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exercise history' });
  }
});

// Helper function to get Monday of a given week
function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const isoString = date.toISOString();
  return isoString.split('T')[0] || isoString.substring(0, 10);
}

// GET /analytics/streak - Get streak data
router.get('/streak', async (req: Request, res: Response) => {
  try {
    // Allow customizable weekly goal (default: 3)
    const goalParam = req.query.weeklyGoal as string;
    const weeklyGoal = goalParam ? parseInt(goalParam, 10) : 3;
    
    // Validate goal (must be between 1 and 7)
    if (weeklyGoal < 1 || weeklyGoal > 7 || isNaN(weeklyGoal)) {
      return res.status(400).json({ error: 'Weekly goal must be between 1 and 7' });
    }

    // Fetch all workouts ordered by date
    const workouts = await prisma.workout.findMany({
      where: {
        endedAt: {
          not: null, // Only count completed workouts
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    if (workouts.length === 0) {
      return res.json({
        currentStreak: 0,
        longestStreak: 0,
        weeklyGoal,
        currentWeekProgress: 0,
        calendarData: [],
        weeklyHistory: [],
      });
    }

    // Group workouts by week (Monday-Sunday)
    const weeklyMap = new Map<string, any[]>();
    workouts.forEach(workout => {
      const weekStart = getWeekStartDate(new Date(workout.startedAt));
      const weekKey = formatDate(weekStart);
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, []);
      }
      weeklyMap.get(weekKey)!.push(workout);
    });

    // Convert to sorted array (newest first)
    const weeklyData = Array.from(weeklyMap.entries())
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
        break; // Streak broken
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    for (const week of weeklyData.reverse()) { // Reverse to go chronological
      if (week.metGoal) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Get current week progress
    const now = new Date();
    const currentWeekStart = getWeekStartDate(now);
    const currentWeekKey = formatDate(currentWeekStart);
    const currentWeekData = weeklyData.find(w => w.weekStartDate === currentWeekKey);
    const currentWeekProgress = currentWeekData ? currentWeekData.workoutCount : 0;

    // Generate calendar data (last 84 days / 12 weeks)
    const calendarData: any[] = [];
    const daysToShow = 84;
    const startDate = new Date(now.getTime() - (daysToShow - 1) * 24 * 60 * 60 * 1000);

    // Group workouts by day
    const dailyMap = new Map<string, number>();
    workouts.forEach(workout => {
      const dateKey = formatDate(new Date(workout.startedAt));
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1);
    });

    // Generate calendar array
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = formatDate(date);
      const workoutCount = dailyMap.get(dateKey) || 0;
      
      // Calculate intensity (0-4 scale)
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

    res.json({
      currentStreak,
      longestStreak,
      weeklyGoal,
      currentWeekProgress,
      calendarData,
      weeklyHistory: weeklyData.reverse().slice(0, 12), // Last 12 weeks, newest first
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch streak data' });
  }
});

export default router;
