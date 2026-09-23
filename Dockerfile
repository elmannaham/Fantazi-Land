# Multi-stage Dockerfile optimisé pour Next.js (Standalone)
FROM node:22-alpine AS base
# openssl : requis par le moteur Prisma sur Alpine (musl)
RUN apk add --no-cache libc6-compat openssl

# 1. Dépendances
FROM base AS deps
WORKDIR /app

# Le schéma doit être présent avant `npm ci` : le script postinstall lance `prisma generate`
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# 2. Construction
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Les variables NEXT_PUBLIC_* sont figées dans le bundle au build :
# Railway les transmet comme build args lorsqu'elles sont déclarées ici.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SUPABASE_S3_ENDPOINT
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_SUPABASE_S3_ENDPOINT=$NEXT_PUBLIC_SUPABASE_S3_ENDPOINT \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate
RUN npm run build

# 3. Exécution en production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
