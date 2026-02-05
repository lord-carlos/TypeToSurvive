# Type To Survive

A cyberpunk-themed typing survival game where words fly toward the player from all directions.

## Features

- Type words before they reach you
- Increasing difficulty over time
- Cyberpunk neon aesthetic
- Leaderboard system
- Single-page application (no routing)
- Start by typing "START"

## Tech Stack

### Frontend
- Vue.js 3 with Composition API
- TypeScript
- Vite
- Tailwind CSS with cyberpunk color palette
- HTML5 Canvas for game rendering

### Backend
- Node.js
- Express
- TypeScript
- SQLite with better-sqlite3
- RESTful API

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TypeToSurvive
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

### Running the Application

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### API Endpoints

- `GET /` - API status check
- `GET /api/leaderboard` - Get top 10 scores
- `POST /api/scores` - Submit a new score

## Game Rules

1. Type "START" on the title screen to begin
2. Words will spawn from the edges and move toward the center
3. Type the first letter of any word to start typing it
4. Complete words before they reach the center
5. Each word that reaches you reduces your health by 10
6. Game ends when health reaches 0
7. Submit your score to the leaderboard

## Difficulty Progression

The game gets harder over time:
- Spawn rate increases
- Words move faster
- Words become longer
- New difficulty levels every 30 seconds

## Word Categories

- Easy: 3-4 characters
- Medium: 5-6 characters
- Hard: 7-9 characters
- Expert: 10+ characters

## Cyberpunk Color Palette

- Neon Pink: #FF00FF
- Neon Blue: #00FFFF
- Neon Green: #00FF00
- Neon Purple: #9D00FF
- Neon Yellow: #FFFF00
- Dark Background: #0D0221
- Cyan: #00F0FF
- Magenta: #FF0055
- Lime: #39FF14

## Project Structure

```
TypeToSurvive/
├── frontend/          # Vue.js + Vite + TypeScript
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── composables/  # Composable functions
│   │   ├── game/         # Game logic
│   │   ├── data/         # Word dictionary
│   │   └── utils/        # Utility functions
│   └── package.json
├── backend/           # Express + TypeScript
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── database/     # SQLite database
│   │   └── types/        # TypeScript types
│   └── package.json
├── shared/            # Shared TypeScript types
└── assets/            # Sound effects and images
```

## TODO

- [ ] Download and add sound effects
- [ ] Implement sound manager
- [ ] Add more visual effects (screen shake, particles)
- [ ] Expand word dictionary
- [ ] Add player authentication (optional)
- [ ] Implement real-time multiplayer (optional)
- [ ] Add more difficulty levels
- [ ] Mobile responsive design

## License

MIT
