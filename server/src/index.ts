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

// Public routes
app.use('/auth', authRoutes);

// Protected routes (require authentication)
app.use('/routines', routineRoutes);
app.use('/workouts', workoutRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/sync', syncRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
