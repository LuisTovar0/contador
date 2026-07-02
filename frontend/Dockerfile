# Build stage
FROM node:22-slim AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the SvelteKit app
RUN pnpm run build

# Runner stage
FROM node:22-slim AS runner
WORKDIR /app

# Copy built server output and production node_modules from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080

# Run the SvelteKit Node adapter server
CMD ["node", "build/index.js"]
