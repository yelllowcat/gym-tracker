import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// During Docker build, we might not have a DATABASE_URL.
// But 'prisma generate' requires some string to be present if it's defined in config.
// However, at runtime (migrate deploy), we MUST have the real URL.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === 'production') {
  // If we are in production and it's missing, we want to know why.
  console.warn('WARNING: DATABASE_URL is not set in production environment.');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl || 'postgresql://dummy:dummy@localhost:5432/dummy',
  },
});
