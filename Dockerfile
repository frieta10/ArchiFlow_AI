# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files for production install
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Install tsx globally to run the server in production
RUN npm install -g tsx

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy backend source code (including compiled JS if we were compiling TS, but here we use tsx or need to copy source)
# Since we are using tsx in dev, for prod we should ideally compile server too.
# However, given the setup, running tsx in prod is acceptable for small/medium scale,
# OR we can just copy the TS files and use tsx.
# For robustness, let's copy the server directory.
COPY server ./server
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Expose port
ENV PORT=8080
EXPOSE 8080

# Environment variables should be injected by Cloud Run, but we set defaults
ENV NODE_ENV=production

# Start the server
CMD ["tsx", "server/server.ts"]
