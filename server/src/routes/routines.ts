import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /: Include exercises ordered by order
router.get('/', async (req: Request, res: Response) => {
  try {
    const routines = await prisma.routine.findMany({
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
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const routine = await prisma.routine.findUnique({
      where: { id },
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
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, exercises } = req.body;

    // Basic validation
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const routine = await prisma.routine.create({
      data: {
        name,
        exercises: {
          create: exercises?.map((e: any, index: number) => ({
            name: e.name,
            targetSets: e.targetSets,
            targetReps: e.targetReps,
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
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, exercises } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Check if routine exists
      const existing = await tx.routine.findUnique({ where: { id } });
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
              targetSets: e.targetSets,
              targetReps: e.targetReps,
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
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    // Use transaction to ensure exercises are deleted first (simulating cascade)
    await prisma.$transaction([
      prisma.routineExercise.deleteMany({
        where: { routineId: id },
      }),
      prisma.routine.delete({
        where: { id },
      }),
    ]);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    // Prisma throws error if record not found
    res.status(500).json({ error: 'Failed to delete routine' });
  }
});

export default router;
