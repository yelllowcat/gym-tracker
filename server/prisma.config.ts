import 'dotenv/config';
import { defineConfig } from 'prisma/config';

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.error('CRITICAL ERROR: DATABASE_URL is not set in the environment!');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
