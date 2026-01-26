import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:g3vn3wtmqbys5xyd@gymtracker-j1lnpw:5432/gymtracker_db';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  WARNING: DATABASE_URL not found in src/db.ts env, using fallback connection string.');
}

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
