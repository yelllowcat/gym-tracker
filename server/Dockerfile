FROM node:22-alpine

WORKDIR /app

# Set default envs
ENV PORT=3000

# Install dependencies
COPY package*.json ./
RUN npm ci --include=dev

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

# Set production env for runtime
ENV NODE_ENV=production

# Copy startup script
COPY start.sh .
RUN chmod +x start.sh

# Expose port and start
EXPOSE 3000
CMD ["./start.sh"]
