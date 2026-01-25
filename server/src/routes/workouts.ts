import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /: List history.
// Order by startedAt desc.
// Include basic info (maybe count of exercises).
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: req.userId! },
      orderBy: {
        startedAt: 'desc',
      },
      include: {
        _count: {
          select: { exercises: true },
        },
      },
    });
    res.json(workouts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// GET /:id: Detail view. Include exercises and sets.
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const workout = await prisma.workout.findFirst({
      where: { id, userId: req.userId! },
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
          },
          include: {
            sets: {
              orderBy: {
                // Assuming sets don't have an order field, relying on insertion order or ID isn't guaranteed but 
                // typical usage suggests they come back in order if created together. 
                // Wait, schema doesn't have order on WorkoutSet.
                // I'll trust prisma's default return order or order by ID if needed, 
                // but usually user interface handles set ordering or we add an index.
                // For now, no orderBy on sets as per schema limitations.
                // Actually, I can order by ID just to be deterministic.
                id: 'asc',
              },
            },
          },
        },
      },
    });

    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    res.json(workout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch workout' });
  }
});

// POST /: Create Workout.
// Body: { name, routineId (optional), startedAt, endedAt, exercises: { name, order, sets: { weight, reps, rir, completed }[] }[] }
// Deep nested write: create: exercises: { create: sets: { create } }.
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, routineId, startedAt, endedAt, exercises } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const workoutData: any = {
      userId: req.userId!,
      name,
      routineId: routineId || null,
      exercises: {
        create: exercises?.map((e: any, index: number) => ({
          name: e.name,
          order: e.order !== undefined ? e.order : index, // Use provided order or index
          sets: {
            create: e.sets?.map((s: any) => ({
              weight: s.weight,
              reps: s.reps,
              rir: s.rir,
              completed: s.completed || false,
            })) || [],
          },
        })) || [],
      },
    };

    if (startedAt) {
      workoutData.startedAt = new Date(startedAt);
    }

    if (endedAt) {
      workoutData.endedAt = new Date(endedAt);
    }

    const workout = await prisma.workout.create({
      data: workoutData,
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
          },
          include: {
            sets: {
              orderBy: {
                id: 'asc'
              }
            },
          },
        },
      },
    });

    res.status(201).json(workout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
});

export default router;
