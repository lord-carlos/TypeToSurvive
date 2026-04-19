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

COPY backend/src ./backend/src

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

RUN mkdir -p /app/backend/data

EXPOSE 3001

CMD ["bun", "run", "backend/src/server.ts"]
