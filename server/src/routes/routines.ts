import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /: Include exercises ordered by order
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const routines = await prisma.routine.findMany({
      where: { userId: req.userId! },
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    res.json(routines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch routines' });
  }
});

// GET /:id: Get single routine with exercises
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const routine = await prisma.routine.findFirst({
      where: { id, userId: req.userId! },
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!routine) {
      res.status(404).json({ error: 'Routine not found' });
      return;
    }

    res.json(routine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch routine' });
  }
});

// POST /: Create Routine + RoutineExercises
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, exercises } = req.body;

    // Basic validation
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const routine = await prisma.routine.create({
      data: {
        userId: req.userId!,
        name,
        exercises: {
          create: exercises?.map((e: any, index: number) => ({
            name: e.name,
            targetSets: e.targetSets || 3,
            targetReps: e.targetReps || 10,
            order: index,
          })) || [],
        },
      },
      include: {
        exercises: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    res.status(201).json(routine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create routine' });
  }
});

// PUT /:id: Update routine. Delete all existing exercises and re-create.
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, exercises } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Check if routine exists and belongs to user
      const existing = await tx.routine.findFirst({ where: { id, userId: req.userId! } });
      if (!existing) {
        throw new Error('Routine not found');
      }

      // Delete existing exercises
      await tx.routineExercise.deleteMany({
        where: { routineId: id },
      });

      // Update routine and create new exercises
      const updatedRoutine = await tx.routine.update({
        where: { id },
        data: {
          name,
          exercises: {
            create: exercises?.map((e: any, index: number) => ({
              name: e.name,
              targetSets: e.targetSets || 3,
              targetReps: e.targetReps || 10,
              order: index,
            })) || [],
          },
        },
        include: {
          exercises: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      return updatedRoutine;
    });

    res.json(result);
  } catch (error: any) {
    console.error(error);
    if (error.message === 'Routine not found') {
      res.status(404).json({ error: 'Routine not found' });
    } else {
      res.status(500).json({ error: 'Failed to update routine' });
    }
  }
});

// DELETE /:id: Delete routine
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    // Delete routine (cascade will handle exercises)
    const deleted = await prisma.routine.deleteMany({
      where: { id, userId: req.userId! },
    });

    if (deleted.count === 0) {
      res.status(404).json({ error: 'Routine not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    // Prisma throws error if record not found
    res.status(500).json({ error: 'Failed to delete routine' });
  }
});

export default router;
