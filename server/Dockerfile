FROM node:23-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

# Expose port and start
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
