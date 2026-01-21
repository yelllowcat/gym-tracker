import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7 requires a string for url in the config file.
// We provide a fallback to avoid validation errors, but the actual 
// connection will still fail if the real URL is missing.
const databaseUrl = process.env.DATABASE_URL || 'postgresql://missing_db_url:missing_db_url@localhost:5432/missing_db_url';

if (!process.env.DATABASE_URL) {
  console.error('⚠️  WARNING: DATABASE_URL is not set in the environment.');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
});
