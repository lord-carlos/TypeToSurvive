# AGENTS.md - Type To Survive

## Project Overview
Cyberpunk-themed typing survival game. Players type words before they reach center. Words spawn from edges, increase in difficulty over time.

## Tech Stack

### Frontend
- **Vue.js 3** with Composition API (`<script setup>`)
- **TypeScript** (strict mode)
- **Vite** (build tool)
- **Tailwind CSS** with cyberpunk colors
- **HTML5 Canvas** for game rendering

### Backend
- **Node.js** with Express + TypeScript
- **SQLite** via `better-sqlite3`
- **CommonJS** modules (`type: "commonjs"`)

## Project Structure
```
TypeToSurvive/
├── frontend/           # Vue.js + Vite
│   └── src/
│       ├── components/      # Vue components
│       ├── composables/    # GameEngine class
│       ├── game/          # Game types
│       └── data/          # Word dictionary
├── backend/            # Express API
│   └── src/
│       ├── routes/        # API endpoints
│       └── database/      # SQLite
└── shared/             # Shared TypeScript types
```

## Coding Conventions

### TypeScript
- Strict mode enabled
- Use `import type { X }` for type-only imports
- Prefer `interface` for objects, `type` for unions
- Shared types in `/shared/types.ts`

### Vue.js
- Always use `<script setup lang="ts">`
- Use `ref<T>()` for reactive primitives
- Use `computed()` for derived state
- Define emits: `defineEmits<{ event: [payload] }>()`
- Cleanup events in `onUnmounted()`

### Class Design (GameEngine)
- **Configuration at top**: All constants grouped by purpose
- **Clear sections**: 
  ```typescript
  // ===========================================
  // CONFIGURATION
  // STATE
  // METHODS
  // ===========================================
  ```
- **Private methods**: Prefix with `private`
- **Public API**: Only expose necessary methods

### Naming Conventions
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types: `PascalCase`
- Files: `kebab-case.vue`, `kebab-case.ts`

### File Organization
**Import order:**
```typescript
// 1. External libraries
import express from 'express';

// 2. Type imports
import type { GameState } from '../../shared/types';

// 3. Internal imports
import GameEngine from '../composables/useGameEngine';
```

## Game Loop Pattern
1. `start()`: Initialize and begin `requestAnimationFrame`
2. `gameLoop()`: Call `update()` and `render()`
3. `update(deltaTime)`: Update state (words, particles, difficulty)
4. `render()`: Draw to canvas
5. `stop()`: Cancel animation and cleanup

## Development
```bash
# Backend (Terminal 1)
cd backend && npm run dev    # :3001

# Frontend (Terminal 2)
cd frontend && npm run dev    # :5173
```

## Important Notes
- No routing (single-page app)
- Game config at top of `GameEngine` class
- Prevent browser shortcuts (Backspace)
- Clear `node_modules/.vite` if errors persist
