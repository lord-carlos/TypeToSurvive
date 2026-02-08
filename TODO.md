# TODO.md - Type To Survive

## High Priority

### Sound Effects
- [x] Download sound files from OpenGameArt.org or Freesound.org:
  - Explosion sound (word completion) - downloaded from OpenGameArt.org
  - Damage sound (word reaches center) - downloaded from OpenGameArt.org
  - Typing sound (keypress) - synthetic oscillator beep (replace with real sound later)
  - Game over sound - downloaded from OpenGameArt.org
- [x] Create `frontend/src/utils/soundEffects.ts` sound manager
- [x] Integrate sounds into GameEngine:
  - Play typing sound on `handleKeyPress()`
  - Play explosion sound on `createExplosion()`
  - Play damage sound when word reaches center
  - Play game over sound on game end

### Gameplay Fixes
- [x] Add localStorage for username persistence in GameOver.vue
  - Save username when score is submitted
  - Load saved username on component mount
- [x] Test and fix any remaining typing bugs
- [x] Ensure word selection logic works correctly (prioritize closest word + already typed)
- [x] Add wrong key visual feedback (red flash on player)

## Medium Priority

### Visual Polish
- [x] Add level up visual effect (screen flash, text announcement)
- [x] Add level up sound effect
- [x] Add screen shake effect when player takes damage
- [x] Add more particle variety (colors, sizes, speeds)
- [x] Add word spawn animation (fade in, scale up)
- [x] Improve word rendering with glow effects
- [x] Add background grid or cyberpunk pattern
- [x] Add player idle animation (pulsing, rotation)

### Game Features
- [ ] Expand word dictionary (currently 50 words)
  - Aim for 200-500 words total
  - Better balance across difficulty levels
  - Add themed word categories (optional)
- [ ] Add more difficulty levels (currently 6)
  - Continue progression beyond level 6
  - Add chaos mode (words spawn from all sides rapidly)
- [x] Add visual feedback for correct/incorrect typing
  - Red flash on wrong key
  - Green flash on correct word completion
- [ ] Add power-ups (optional):
  - Slow motion
  - Shield (one damage immunity)
  - Clear screen

### UX Improvements
- [ ] Add pause functionality (ESC key)
  - Pause menu with resume option
  - Stop game loop while paused
- [ ] Add volume control for sounds
  - Mute/unmute option
  - Volume slider in settings
- [ ] Add keyboard shortcuts:
  - Pause: P or ESC
  - Restart: R (after game over)
  - Quit: Q (optional)
- [ ] Improve mobile responsiveness
  - Touch keyboard support
  - Responsive canvas sizing
  - Mobile-friendly UI

## Low Priority

### DevOps/Deployment
- [x] Create Docker container setup
  - Dockerfile for frontend (multi-stage build)
  - Dockerfile for backend
  - docker-compose.yml to orchestrate both services
  - Environment configuration

### Code Quality
- [ ] Add unit tests for GameEngine class
- [ ] Add E2E tests for game flow
- [ ] Add TypeScript strict type checking for all files
- [ ] Add ESLint and Prettier configuration
- [ ] Add code coverage reporting

### Performance
- [ ] Optimize particle system
  - Object pooling for particles
  - Limit max particles on screen
- [ ] Optimize word rendering
  - Cache font measurements
  - Batch draw calls
- [ ] Add FPS counter (optional debug feature)

### Documentation
- [ ] Add inline code comments for complex logic
- [ ] Create player guide/instructions
- [ ] Add development documentation
- [ ] Document API endpoints in README

### Optional Features
- [ ] Add player authentication
  - Login/register system
  - Personal stats tracking
  - Score history
- [ ] Add multiplayer features
  - Real-time competition via WebSockets
  - Leaderboard updates in real-time
  - Chat system
- [ ] Add achievements system
  - First 10 words destroyed
  - Survive 1 minute
  - Reach level 5
  - Complete 100 words total
- [ ] Add word themes
  - Technology words
  - Space words
  - Cyberpunk slang
  - Random rotation

### Assets
- [ ] Create favicon.ico
- [ ] Add logo/icon
- [ ] Add loading screen with progress
- [ ] Add victory/achievement icons
- [ ] Create custom font (optional cyberpunk style)

## Bug Fixes
- [ ] Test for edge cases:
  - What happens if player types multiple keys quickly?
  - What if word spawns exactly on top of another?
  - What if all words are completed at once?
- [ ] Fix any remaining issues with word selection
- [ ] Test browser compatibility (Chrome, Firefox, Safari)
- [ ] Test on different screen sizes

## Completed ✅
- [x] Project setup (Vue.js, Express, TypeScript)
- [x] Tailwind CSS with cyberpunk colors
- [x] Start Screen (type "START" to begin)
- [x] Game Canvas with HTML5 rendering
- [x] Game Engine with clean code (config at top)
- [x] Word spawning from edges
- [x] Word movement toward center
- [x] Typing detection and word matching
- [x] Word explosion particle effects
- [x] Health system
- [x] Game over detection
- [x] Score and time tracking
- [x] Difficulty progression (6 levels)
- [x] Backend API (scores, leaderboard)
- [x] SQLite database setup
- [x] Game Over screen with leaderboard
- [x] Backspace key prevention
- [x] Typing bug fix (complete word typing)
- [x] Sound effects system (explosion, damage, typing, game over)
- [x] SoundManager class with pre-loaded audio
- [x] AGENTS.md documentation
- [x] Username localStorage persistence
- [x] Word selection priority (closest + already typed)
- [x] Wrong key visual feedback (red flash)
- [x] Debug logging system (dev mode only)
- [x] Increased spawn rate for first 3 levels (faster early game)
- [x] Level up visual effect and sound
- [x] Screen shake on damage
- [x] Particle variety (randomized sizes and speeds)
- [x] Word spawn animation (fade in, scale up)
- [x] Word glow enhancement (distance-based intensity)
- [x] Background grid pattern
- [x] Player pulsing animation

## Future Enhancements
- [ ] Add power-up system with visual pickups
- [ ] Implement wave-based gameplay
- [ ] Add boss words (harder, more HP)
- [ ] Create level select mode
- [ ] Add practice mode (infinite, no health)
- [ ] Implement daily challenges
- [ ] Add statistics tracking (WPM, accuracy)
- [ ] Create mobile app version
