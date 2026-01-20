import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding ...');

  const pushPullLegs = await prisma.routine.create({
    data: {
      name: 'Push / Pull / Legs',
      exercises: {
        create: [
          { name: 'Bench Press', order: 0, targetSets: 3, targetReps: 10 },
          { name: 'Overhead Press', order: 1, targetSets: 3, targetReps: 12 },
          { name: 'Tricep Extensions', order: 2, targetSets: 3, targetReps: 15 },
        ],
      },
    },
  });
  console.log(`Created routine: ${pushPullLegs.name}`);

  const fullBody = await prisma.routine.create({
    data: {
      name: 'Full Body A',
      exercises: {
        create: [
          { name: 'Squat', order: 0, targetSets: 3, targetReps: 5 },
          { name: 'Bench Press', order: 1, targetSets: 3, targetReps: 5 },
          { name: 'Barbell Row', order: 2, targetSets: 3, targetReps: 8 },
        ],
      },
    },
  });
  console.log(`Created routine: ${fullBody.name}`);

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
