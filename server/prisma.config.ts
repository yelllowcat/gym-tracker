import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Fallback to the provided connection string if the environment variable is missing
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:g3vn3wtmqbys5xyd@gymtracker-j1lnpw:5432/gymtracker_db';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  WARNING: DATABASE_URL not found in env, using fallback connection string.');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
});
