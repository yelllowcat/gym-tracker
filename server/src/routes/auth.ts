import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import fs from 'fs';

const logToFile = (message: string) => {
    fs.appendFileSync('/tmp/gym-tracker-debug.log', `${new Date().toISOString()} - ${message}\n`);
};

const router = express.Router();

// Register new user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        logToFile(`[REGISTER] Received request: ${JSON.stringify({ email: req.body.email, hasPassword: !!req.body.password, name: req.body.name })}`);
        console.log('[REGISTER] Received request:', { email: req.body.email, hasPassword: !!req.body.password, name: req.body.name });
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            res.status(409).json({ error: 'Email already registered' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
            },
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : 'No stack';
        logToFile(`[REGISTER ERROR] ${errorMsg}`);
        logToFile(`[REGISTER ERROR STACK] ${errorStack}`);
        console.error('[REGISTER ERROR] Full error:', error);
        console.error('[REGISTER ERROR] Error type:', typeof error);
        console.error('[REGISTER ERROR] Error message:', error instanceof Error ? error.message : String(error));
        console.error('[REGISTER ERROR] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        res.status(500).json({ 
            error: 'Failed to register user', 
            details: error instanceof Error ? error.message : String(error) 
        });
    }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get current user (verify token)
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId! },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Logout (client-side only, just for consistency)
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    // JWT tokens are stateless, so logout is handled client-side by removing the token
    res.json({ message: 'Logged out successfully' });
});

// Refresh token
router.post('/refresh-token', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const token = jwt.sign(
            { userId: req.userId },
            process.env.JWT_SECRET!,
            { expiresIn: '30d' }
        );
        res.json({ token });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

export default router;
