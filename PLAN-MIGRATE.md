# Migration Plan: npm → Bun

Complete plan to switch TypeToSurvive from npm/Node.js to Bun, including switching to `bun:test` and Bun's native SQLite (`bun:sqlite`).

---

## Phase 1: Cleanup & Bootstrap

### 1.1 Delete npm lockfiles
```bash
rm frontend/package-lock.json
rm backend/package-lock.json
```

### 1.2 Delete node_modules
```bash
rm -rf frontend/node_modules
rm -rf backend/node_modules
```

### 1.3 Install dependencies with Bun
```bash
cd frontend && bun install
cd ../backend && bun install
```
This generates `bun.lock` (text-based) files in both directories.

---

## Phase 2: Switch to `bun:sqlite` (Backend)

### 2.1 Rewrite `backend/src/database/db.ts`

**Current** (better-sqlite3):
```ts
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const dbPath = join(process.cwd(), 'data', 'scores.db');
const schemaPath = join(process.cwd(), 'src', 'database', 'schema.sql');

const db = new Database(dbPath);
const schema = readFileSync(schemaPath, 'utf-8');
db.exec(schema);

export default db;
```

**New** (bun:sqlite):
```ts
import { Database } from 'bun:sqlite';
import { readFileSync } from 'fs';
import { join } from 'path';

const backendRoot = join(import.meta.dir, '..', '..');
const dbPath = join(backendRoot, 'data', 'scores.db');
const schemaPath = join(import.meta.dir, 'schema.sql');

const db = new Database(dbPath, { create: true });
const schema = readFileSync(schemaPath, 'utf-8');
db.exec(schema);

export default db;
```

**Differences:**
- Import changes from `better-sqlite3` to `bun:sqlite`
- `new Database(path)` → `new Database(path, { create: true })` (explicit create flag)
- `process.cwd()` → `import.meta.dir` (file-relative paths, works regardless of cwd)
- Schema path uses `import.meta.dir` directly since it's in the same directory
- API is nearly identical: `.prepare()`, `.run()`, `.all()`, `.exec()`, `.close()` all work the same

### 2.2 Verify `backend/src/routes/scores.ts` compatibility

This file imports `db` from `../database/db` and uses:
- `db.prepare(sql).run(...params)` → **compatible** with `bun:sqlite`
- `db.prepare(sql).all()` → **compatible** with `bun:sqlite`
- `result.lastInsertRowid` → **compatible** with `bun:sqlite`

**No changes needed** in `scores.ts`. The `bun:sqlite` API matches `better-sqlite3` for these operations.

### 2.3 Remove `better-sqlite3` from dependencies

In `backend/package.json`, remove from `dependencies`:
```diff
- "better-sqlite3": "^12.6.2",
```

Remove from `devDependencies`:
```diff
- "@types/better-sqlite3": "^7.6.13",
```

`bun:sqlite` is built into Bun — no install needed, no types package needed (Bun ships its own types).

---

## Phase 3: Switch to `bun test` (Backend)

### 3.1 Rewrite `backend/src/routes/__tests__/scores.test.ts`

Bun's test runner uses a Jest-compatible API but with `import { test, expect, describe, beforeAll, afterAll, beforeEach } from 'bun:test'`.

**Changes needed:**
1. Add explicit imports from `bun:test`:
   ```ts
   import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
   ```
2. Remove implicit reliance on Jest globals.
3. The rest of the test code (describe blocks, test cases, expect assertions) is **fully compatible** — no rewrite needed.

**Note on `expect.any()`**: Bun supports `expect.any(Type)` — compatible.

**Note on `supertest`**: Works with Bun. No changes needed for the supertest usage.

**Updated test file** — add this line at the top:
```ts
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
```
Everything else in the file stays the same.

### 3.2 Remove Jest-related dependencies

In `backend/package.json`, remove from `devDependencies`:
```diff
- "@types/jest": "^30.0.0",
- "jest": "^30.2.0",
- "ts-jest": "^29.4.6",
```

Remove from `devDependencies` (if no longer needed for dev):
```diff
- "ts-node": "^10.9.2",
- "nodemon": "^3.1.11",
```
(Bun has built-in TypeScript support and `--watch` mode, replacing both `ts-node` and `nodemon`.)

### 3.3 Update `backend/package.json` scripts

```diff
  "scripts": {
-   "dev": "nodemon",
+   "dev": "bun --watch src/server.ts",
-   "build": "tsc",
+   "build": "bun build src/server.ts --outdir dist --target bun",
-   "start": "node dist/server.js",
+   "start": "bun dist/server.js",
-   "test": "jest",
+   "test": "bun test",
-   "test:watch": "jest --watch",
+   "test:watch": "bun test --watch",
-   "test:coverage": "jest --coverage"
+   "test:coverage": "bun test --coverage"
  }
```

**Note:** The `build` step may still use `tsc` if type checking is desired. Consider keeping a `typecheck` script:
```json
"typecheck": "tsc --noEmit"
```

### 3.4 Delete config files

```bash
rm backend/nodemon.json
rm backend/jest.config.js
```

These are no longer needed — Bun's test runner auto-discovers test files matching `*.test.{ts,js}` and `*.spec.{ts,js}` in any `__tests__` directory.

### 3.5 Known test issue — fix the LIMIT mismatch

The current test expects `toHaveLength(10)` but the SQL uses `LIMIT 50`. Either:
- Fix the SQL in `scores.ts` to use `LIMIT 10`, or
- Update the test assertion to match `LIMIT 50`

This is a pre-existing bug to fix during migration.

---

## Phase 4: Update Frontend (Minimal Changes)

The frontend is a standard Vite + Vue project. No code changes are needed — Bun is used only as the package manager here.

### 4.1 Scripts remain the same

```json
"scripts": {
  "dev": "vite",
  "build": "vue-tsc -b && vite build",
  "preview": "vite preview"
}
```
These all work fine when run via `bun run dev`, `bun run build`, etc.

---

## Phase 5: Update Docker

### 5.1 Rewrite `Dockerfile`

```dockerfile
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
```

### 5.2 Update `supervisord.conf`

```diff
- command=node /app/backend/dist/server.js
+ command=bun /app/backend/dist/server.js
```

---

## Phase 6: Update Documentation

### 6.1 `README.md` changes

| Section | Before | After |
|---------|--------|-------|
| **Backend** in Tech Stack | `Node.js` | `Bun` |
| **Prerequisites** | `Node.js (v18 or higher)` + `npm` | `Bun (v1 or higher)` |
| **Installation** | `npm install` | `bun install` |
| **Running** | `npm run dev` | `bun run dev` |

### 6.2 `AGENTS.md` changes

- **Backend section**: `Node.js with Express + TypeScript` → `Bun with Express + TypeScript`
- **Backend section**: Add note about `bun:sqlite` replacing `better-sqlite3`
- **Development section**: `npm run dev` → `bun run dev`

### 6.3 `.gitignore` changes

Add Bun-specific entries:
```
# Bun
bun.lockb
```
Note: `bun.lock` (text-based, newer Bun versions) should be **committed** to the repo. Only `bun.lockb` (binary, older format) should be ignored. If both exist, ignore `bun.lockb`.

---

## Phase 7: Final `backend/package.json`

After all removals and updates:

```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "bun --watch src/server.ts",
    "build": "tsc",
    "start": "bun dist/server.js",
    "typecheck": "tsc --noEmit",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "cors": "^2.8.6",
    "express": "^5.2.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "^25.2.1",
    "@types/supertest": "^6.0.3",
    "supertest": "^7.2.2",
    "typescript": "^5.9.3"
  }
}
```

**Removed dependencies:**
- `better-sqlite3` → replaced by `bun:sqlite` (built-in)
- `@types/better-sqlite3` → replaced by Bun's built-in types
- `jest`, `ts-jest`, `@types/jest` → replaced by `bun:test` (built-in)
- `nodemon` → replaced by `bun --watch`
- `ts-node` → replaced by Bun's native TypeScript support

---

## Phase 8: Root-Level Dev Command

Create a root `package.json` to start both servers with a single command:

```json
{
  "name": "typetosurvive",
  "private": true,
  "scripts": {
    "dev": "concurrently -n backend,frontend -c cyan,magenta \"bun --watch backend/src/server.ts\" \"bun run --cwd frontend dev\"",
    "dev:backend": "bun --watch backend/src/server.ts",
    "dev:frontend": "bun run --cwd frontend dev"
  },
  "devDependencies": {
    "concurrently": "^9.1.2"
  }
}
```

Usage:
```bash
bun install
bun run dev
```

Output shows labeled, color-coded logs:
```
[backend]  Server is running on port 3001
[frontend]  VITE v7.2.4  ready in 300ms
```

---

## Execution Order (Step-by-Step Checklist)

- [ ] **Phase 1**: Delete lockfiles + node_modules, run `bun install` in both dirs
- [ ] **Phase 2**: Rewrite `backend/src/database/db.ts` to use `bun:sqlite`
- [ ] **Phase 2**: Remove `better-sqlite3` + `@types/better-sqlite3` from `backend/package.json`
- [ ] **Phase 3**: Add `import { ... } from 'bun:test'` to the test file
- [ ] **Phase 3**: Remove jest/ts-jest/@types/jest/ts-node/nodemon from `backend/package.json`
- [ ] **Phase 3**: Update scripts in `backend/package.json`
- [ ] **Phase 3**: Delete `backend/nodemon.json` and `backend/jest.config.js`
- [ ] **Phase 3**: Fix the LIMIT 10 vs 50 mismatch in test or route
- [ ] **Phase 4**: Verify frontend runs with `bun run dev`
- [ ] **Phase 5**: Update `Dockerfile` to use `oven/bun:1-alpine`
- [ ] **Phase 5**: Update `supervisord.conf` to use `bun` instead of `node`
- [ ] **Phase 6**: Update `README.md` (prerequisites, install, run commands)
- [ ] **Phase 6**: Update `AGENTS.md` (tech stack, dev commands)
- [ ] **Phase 6**: Update `.gitignore` (add `bun.lockb`)
- [ ] **Phase 7**: Run `bun install` to regenerate lockfile with cleaned deps
- [ ] **Verify**: `cd backend && bun test` — all tests pass
- [ ] **Verify**: `cd backend && bun run dev` — server starts on :3001
- [ ] **Verify**: `cd frontend && bun run dev` — dev server starts on :5173
- [ ] **Phase 8**: Create root `package.json` with `concurrently` dev command
- [ ] **Verify**: `bun run dev` from root — both servers start together
- [ ] **Verify**: Game plays end-to-end, scores submit, leaderboard works
