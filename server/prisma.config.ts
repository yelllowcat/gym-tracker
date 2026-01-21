import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Ensure we have a string for Prisma validation, but don't mask the error if it's missing at runtime.
const databaseUrl = process.env.DATABASE_URL || 'postgresql://unconfigured:unconfigured@localhost:5432/unconfigured';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
});
