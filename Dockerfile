# Stage 1: Backend Builder
FROM oven/bun:1-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile
COPY backend/ ./
RUN bun run build

# Stage 2: Frontend Builder
FROM oven/bun:1-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile
COPY frontend/ ./
RUN bun run build

# Stage 3: Runtime with Supervisor
FROM oven/bun:1-alpine
WORKDIR /app

RUN apk add --no-cache nginx supervisor

COPY --from=backend-builder /app/backend/package.json /app/backend/bun.lock ./backend/
WORKDIR /app/backend
RUN bun install --frozen-lockfile --production
WORKDIR /app
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/src/database ./backend/src/database

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

COPY nginx.conf /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
