FROM node:20-alpine

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Install deps (npm install, not ci - no lock file required)
COPY package.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy source
COPY . .

# Generate Prisma + Build Next.js
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

# Push schema, attempt seed, then start
CMD sh -c "npx prisma db push --accept-data-loss --skip-generate && (npx prisma db seed || echo 'Seed skipped') && npm start"
