import axios from 'axios';
import config from '../config/env';

export interface Exercise {
  name: string;
  [key: string]: any;
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface WorkoutSet {
  weight: number;
  reps: number;
  rir: number;
}

export interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  name: string;
  routineId: string;
  startedAt: string;
  endedAt: string;
  exercises?: WorkoutExercise[];
  _count?: {
    exercises: number;
  };
}

export interface AnalyticsStats {
  totalWorkouts: number;
  avgDuration: number;
  totalVolume: number;
  workoutsByWeek: { week: string; count: number }[];
  exerciseStats: ExerciseStat[];
}

export interface ExerciseStat {
  exerciseName: string;
  totalSets: number;
  maxWeight: number;
  avgWeight: number;
  lastPerformed: string;
}

export interface ExerciseHistory {
  exerciseName: string;
  history: WorkoutDataPoint[];
  personalRecord: PersonalRecord | null;
}

export interface WorkoutDataPoint {
  date: string;
  workoutId: string;
  maxWeight: number;
  avgWeight: number;
  totalReps: number;
  totalSets: number;
  sets: { weight: number; reps: number; rir: number | null }[];
}

export interface PersonalRecord {
  weight: number;
  reps: number;
  date: string;
  workoutId: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number;
  currentWeekProgress: number;
  calendarData: CalendarDay[];
  weeklyHistory: WeekData[];
}

export interface CalendarDay {
  date: string;
  workoutCount: number;
  intensity: number;
}

export interface WeekData {
  weekStartDate: string;
  workoutCount: number;
  metGoal: boolean;
}

const client = axios.create({
  baseURL: config.apiUrl,
});

// Request interceptor for debugging
client.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
client.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Response error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export const fetchRoutines = async (): Promise<Routine[]> => {
  const response = await client.get('/routines');
  return response.data;
};

export const fetchRoutineById = async (id: string): Promise<Routine> => {
  const response = await client.get(`/routines/${id}`);
  return response.data;
};

export const createRoutine = async (routine: Omit<Routine, 'id'>) => {
  const response = await client.post('/routines', routine);
  return response.data;
};

export const updateRoutine = async (id: string, routine: Omit<Routine, 'id'>) => {
  const response = await client.put(`/routines/${id}`, routine);
  return response.data;
};

export const deleteRoutine = async (id: string) => {
  await client.delete(`/routines/${id}`);
};

export const fetchWorkouts = async (): Promise<Workout[]> => {
  const response = await client.get('/workouts');
  return response.data;
};

export const fetchWorkoutById = async (id: string): Promise<Workout> => {
  const response = await client.get(`/workouts/${id}`);
  return response.data;
};

export const saveWorkout = async (workout: Omit<Workout, 'id'>) => {
  const response = await client.post('/workouts', workout);
  return response.data;
};

export const fetchAnalytics = async (timeRange: string = '30d'): Promise<AnalyticsStats> => {
  const response = await client.get(`/analytics/stats?timeRange=${timeRange}`);
  return response.data;
};

export const fetchExerciseHistory = async (exerciseName: string, timeRange: string = '30d'): Promise<ExerciseHistory> => {
  const response = await client.get(`/analytics/exercise/${encodeURIComponent(exerciseName)}?timeRange=${timeRange}`);
  return response.data;
};

export const fetchStreakData = async (weeklyGoal: number = 3): Promise<StreakData> => {
  const response = await client.get(`/analytics/streak?weeklyGoal=${weeklyGoal}`);
  return response.data;
};

export default client;
