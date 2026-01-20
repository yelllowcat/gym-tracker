import express, { Request, Response } from 'express';
import cors from 'cors';
import routineRoutes from './routes/routines';
import workoutRoutes from './routes/workouts';
import analyticsRoutes from './routes/analytics';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/routines', routineRoutes);
app.use('/workouts', workoutRoutes);
app.use('/analytics', analyticsRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
