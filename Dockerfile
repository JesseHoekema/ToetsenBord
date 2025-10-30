
FROM node:24-alpine AS builder

WORKDIR /app


RUN corepack enable && corepack prepare pnpm@latest --activate


COPY package*.json ./
COPY pnpm-lock.yaml* ./


RUN pnpm install --frozen-lockfile || pnpm install


COPY . .


RUN pnpx prisma generate


ENV PROTOCOL_HEADER=x-forwarded-proto
ENV HOST_HEADER=x-forwarded-host
ENV NODE_ENV=production
ENV PORT=5174


RUN pnpm run build


RUN pnpm prune --prod


FROM node:24-alpine

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate


COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma 

EXPOSE 5174

ENV NODE_ENV=production
ENV PORT=5174
ENV PROTOCOL_HEADER=x-forwarded-proto
ENV HOST_HEADER=x-forwarded-host


CMD ["node", "build"]
