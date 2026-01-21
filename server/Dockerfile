FROM node:22-alpine

WORKDIR /app

# Set default envs
ENV NODE_ENV=production
ENV PORT=3000

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

# Copy startup script
COPY start.sh .
RUN chmod +x start.sh

# Expose port and start
EXPOSE 3000
CMD ["./start.sh"]
