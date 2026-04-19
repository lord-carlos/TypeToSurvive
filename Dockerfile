FROM oven/bun:1 AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile
COPY backend/ ./
RUN bun run build

FROM oven/bun:1 AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/bun.lock ./frontend/
COPY shared/ ./shared/
WORKDIR /app/frontend
RUN bun install --frozen-lockfile
COPY frontend/ ./
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app

COPY --from=backend-builder /app/backend/package.json /app/backend/bun.lock ./backend/
WORKDIR /app/backend
RUN bun install --frozen-lockfile --production
WORKDIR /app
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/src/database/schema.sql ./backend/dist/database/schema.sql

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

RUN mkdir -p /app/backend/data

EXPOSE 3001

CMD ["bun", "run", "backend/dist/server.js"]
