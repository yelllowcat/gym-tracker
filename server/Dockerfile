FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

# Expose port and start
EXPOSE 3000
CMD ["sh", "-c", "echo \"Checking environment...\" && env | grep -q DATABASE_URL && echo \"DATABASE_URL is found.\" || echo \"DATABASE_URL is NOT found.\" && npx prisma migrate deploy && npm start"]
