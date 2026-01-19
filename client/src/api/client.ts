import axios from 'axios';

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
  exercises: WorkoutExercise[];
}

const client = axios.create({
  baseURL: 'http://localhost:3000',
});

export const fetchRoutines = async (): Promise<Routine[]> => {
  const response = await client.get('/routines');
  return response.data;
};

export const createRoutine = async (routine: Omit<Routine, 'id'>) => {
  const response = await client.post('/routines', routine);
  return response.data;
};

export const fetchWorkouts = async (): Promise<Workout[]> => {
  const response = await client.get('/workouts');
  return response.data;
};

export const saveWorkout = async (workout: Omit<Workout, 'id'>) => {
  const response = await client.post('/workouts', workout);
  return response.data;
};

export default client;
