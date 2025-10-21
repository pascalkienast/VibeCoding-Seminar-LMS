# Multi-stage Dockerfile for Next.js 15 app with Turbopack
# Assumes env vars are provided at runtime (see README)

FROM node:20-alpine AS base

# Install OS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Dependencies layer (cached) ---
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --include=dev

# --- Build layer ---
FROM base AS build
ENV NODE_ENV=production
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next.js needs these at build if you use server actions or static generation referencing env
# Provide sensible defaults; override in CI if needed
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runtime (distroless-like) ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy needed build artifacts
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
# Copy public directory (includes presentations, images, and other static assets)
COPY --from=build /app/public ./public

# Use non-root user
USER nextjs

# Expose port and start
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]


