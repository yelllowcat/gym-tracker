import express, { Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Upload local data to cloud (migration from local to cloud)
router.post('/upload', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { routines, workouts } = req.body;
        const userId = req.userId!;

        // Validate input
        if (!Array.isArray(routines) && !Array.isArray(workouts)) {
            res.status(400).json({ error: 'Invalid data format' });
            return;
        }

        // Use transaction to ensure all-or-nothing upload
        await prisma.$transaction(async (tx) => {
            // Upload routines
            if (Array.isArray(routines)) {
                for (const routine of routines) {
                    await tx.routine.create({
                        data: {
                            userId,
                            name: routine.name,
                            exercises: {
                                create: routine.exercises.map((ex: any) => ({
                                    name: ex.name,
                                    order: ex.order,
                                    targetSets: ex.targetSets,
                                    targetReps: ex.targetReps,
                                })),
                            },
                        },
                    });
                }
            }

            // Upload workouts
            if (Array.isArray(workouts)) {
                for (const workout of workouts) {
                    await tx.workout.create({
                        data: {
                            userId,
                            name: workout.name,
                            routineId: workout.routineId || null,
                            startedAt: new Date(workout.startedAt),
                            endedAt: workout.endedAt ? new Date(workout.endedAt) : null,
                            exercises: {
                                create: workout.exercises?.map((ex: any) => ({
                                    name: ex.name,
                                    order: ex.order || 0,
                                    sets: {
                                        create: ex.sets?.map((set: any) => ({
                                            weight: set.weight,
                                            reps: set.reps,
                                            rir: set.rir,
                                            completed: set.completed ?? true,
                                        })) || [],
                                    },
                                })) || [],
                            },
                        },
                    });
                }
            }
        });

        res.json({
            success: true,
            message: 'Data uploaded successfully',
            routinesCount: routines?.length || 0,
            workoutsCount: workouts?.length || 0,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload data' });
    }
});

// Download all user data (migration from cloud to local)
router.get('/download', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;

        // Fetch all user data
        const [routines, workouts] = await Promise.all([
            prisma.routine.findMany({
                where: { userId },
                include: {
                    exercises: {
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.workout.findMany({
                where: { userId },
                include: {
                    exercises: {
                        include: {
                            sets: true,
                        },
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy: { startedAt: 'desc' },
            }),
        ]);

        res.json({
            routines,
            workouts,
            summary: {
                routinesCount: routines.length,
                workoutsCount: workouts.length,
            },
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download data' });
    }
});

// Clear all user data (for testing/reset purposes)
router.delete('/clear', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;

        // Delete all user data (cascading deletes will handle related records)
        await prisma.$transaction([
            prisma.routine.deleteMany({ where: { userId } }),
            prisma.workout.deleteMany({ where: { userId } }),
        ]);

        res.json({ success: true, message: 'All data cleared' });
    } catch (error) {
        console.error('Clear error:', error);
        res.status(500).json({ error: 'Failed to clear data' });
    }
});

export default router;
