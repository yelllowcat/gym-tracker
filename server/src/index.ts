import express, { Request, Response } from 'express';
import cors from 'cors';
import routineRoutes from './routes/routines';
import workoutRoutes from './routes/workouts';
import analyticsRoutes from './routes/analytics';
import authRoutes from './routes/auth';
import syncRoutes from './routes/sync';

const app = express();
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`);
  next();
});

// Public routes
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'Gym Tracker API is running', version: '1.0.0' });
});

app.use('/auth', authRoutes);

// Protected routes (require authentication)
app.use('/routines', routineRoutes);
app.use('/workouts', workoutRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/sync', syncRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', version: '1.0.1', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

console.log('Starting server...');
console.log('Env Check:', {
  DATABASE_URL_SET: !!process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
