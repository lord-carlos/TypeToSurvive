import type { WordEntity, Particle, DifficultyConfig } from '../game/types';
import type { GameState } from '../../../shared/types';
import { wordsByDifficulty } from '../data/words';
import soundManager from '../utils/soundEffects';

export class GameEngine {
  // ===========================================
  // CONFIGURATION - All important variables at top
  // ===========================================

  // Game settings
  readonly INITIAL_SPAWN_RATE = 2000;
  readonly INITIAL_WORD_SPEED = 50;
  readonly INITIAL_HEALTH = 100;
  readonly CANVAS_WIDTH = 800;
  readonly CANVAS_HEIGHT = 600;

  // Difficulty progression
  readonly DIFFICULTY_LEVELS: DifficultyConfig[] = [
    { spawnRate: 1500, speedMultiplier: 1.0, wordDifficulty: 'easy' },
    { spawnRate: 1300, speedMultiplier: 1.2, wordDifficulty: 'medium' },
    { spawnRate: 1100, speedMultiplier: 1.4, wordDifficulty: 'medium' },
    { spawnRate: 1400, speedMultiplier: 1.6, wordDifficulty: 'hard' },
    { spawnRate: 1200, speedMultiplier: 1.8, wordDifficulty: 'hard' },
    { spawnRate: 1000, speedMultiplier: 2.0, wordDifficulty: 'expert' },
  ];

  readonly LEVEL_UP_INTERVAL = 30;

  // Scoring
  readonly SCORE_PER_WORD = 100;
  readonly SCORE_PER_CHARACTER = 10;
  readonly TIME_BONUS_MULTIPLIER = 0.5;

  // Visual settings
  readonly PARTICLE_COUNT = 20;
  readonly PARTICLE_LIFETIME = 500;

  // Colors
  readonly COLORS = {
    neonPink: '#FF00FF',
    neonBlue: '#00FFFF',
    neonGreen: '#00FF00',
    neonPurple: '#9D00FF',
    neonYellow: '#FFFF00',
    white: '#FFFFFF',
  };

  // ===========================================
  // STATE
  // ===========================================

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private words: WordEntity[] = [];
  private particles: Particle[] = [];
  private gameState: GameState;
  private currentDifficultyIndex = 0;
  private lastTime = 0;
  private spawnTimer = 0;
  private difficultyTimer = 0;
  private animationId: number | null = null;
  private onGameOver: ((state: GameState) => void) | null = null;
  private currentActiveWord: WordEntity | null = null;
  private isPaused = false;
  private scaleFactor = 1;
  private wrongKeyFlashTimer = 0;
  readonly WRONG_KEY_FLASH_DURATION = 200;
  private levelUpAnimationTimer = 0;
  readonly LEVEL_UP_ANIMATION_DURATION = 2000;
  private screenShakeTimer = 0;
  readonly SCREEN_SHAKE_DURATION = 300;
  private screenShakeIntensity = 0;
  readonly SCREEN_SHAKE_MAX_INTENSITY = 10;
  private playerAnimationTime = 0;

  // ===========================================
  // DEBUG HELPERS
  // ===========================================

  private debugLog(message: string, data?: any): void {
    if (import.meta.env.DEV) {
      console.log(`[GameEngine] ${message}`, data || '');
    }
  }

  // ===========================================
  // CONSTRUCTOR
  // ===========================================

  constructor(canvas: HTMLCanvasElement, onGameOver?: (state: GameState) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gameState = this.initializeState();
    this.onGameOver = onGameOver || null;
    this.setupCanvas();
  }

  // ===========================================
  // INITIALIZATION
  // ===========================================

  private initializeState(): GameState {
    return {
      health: this.INITIAL_HEALTH,
      score: 0,
      wordsDestroyed: 0,
      timeSurvived: 0,
      difficultyLevel: 1,
      isGameOver: false
    };
  }

  private setupCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    this.updateCanvasSize();
  }

  public resize(width: number, height: number): void {
    if (!this.canvas || !this.ctx) return;
    
    // Calculate scale factor while maintaining aspect ratio
    const targetAspect = this.CANVAS_WIDTH / this.CANVAS_HEIGHT;
    const containerAspect = width / height;
    
    let newWidth: number;
    let newHeight: number;
    
    if (containerAspect > targetAspect) {
      // Container is wider - fit to height
      newHeight = height;
      newWidth = height * targetAspect;
    } else {
      // Container is taller - fit to width
      newWidth = width;
      newHeight = width / targetAspect;
    }
    
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;
    this.scaleFactor = newWidth / this.CANVAS_WIDTH;
    
    // Scale existing words to new canvas size
    this.scaleWords();
  }

  private scaleWords(): void {
    // Words positions are relative, so we recalculate based on the new center
    // This method is called after canvas resize to adjust positions
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  public togglePause(): boolean {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
    return this.isPaused;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  private updateCanvasSize(): void {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (parent) {
      this.resize(parent.clientWidth, parent.clientHeight);
    }
  }

  // ===========================================
  // GAME LOOP
  // ===========================================

  public start(): void {
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private gameLoop(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (!this.isPaused) {
      this.update(deltaTime);
    }
    this.render();

    if (!this.gameState.isGameOver) {
      this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    } else {
      soundManager.playGameOverSound();
      this.stop();
      if (this.onGameOver) {
        this.onGameOver(this.gameState);
      }
    }
  }

  // ===========================================
  // UPDATE
  // ===========================================

  private update(deltaTime: number): void {
    if (this.gameState.isGameOver) return;

    // Update time
    this.gameState.timeSurvived += deltaTime / 1000;

    // Check for level up
    this.checkLevelUp(deltaTime);

    // Spawn words
    this.updateSpawnTimer(deltaTime);

    // Update words
    this.updateWords(deltaTime);

    // Update particles
    this.updateParticles(deltaTime);

    // Update wrong key flash timer
    if (this.wrongKeyFlashTimer > 0) {
      this.wrongKeyFlashTimer -= deltaTime;
    }

    // Update level up animation timer
    if (this.levelUpAnimationTimer > 0) {
      this.levelUpAnimationTimer -= deltaTime;
    }

    // Update screen shake timer
    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer -= deltaTime;
      this.screenShakeIntensity *= 0.95;
    }

    // Update player animation time
    this.playerAnimationTime += deltaTime / 1000;
  }

  private checkLevelUp(deltaTime: number): void {
    this.difficultyTimer += deltaTime;
    if (this.difficultyTimer >= this.LEVEL_UP_INTERVAL * 1000) {
      this.difficultyTimer = 0;
      if (this.currentDifficultyIndex < this.DIFFICULTY_LEVELS.length - 1) {
        this.currentDifficultyIndex++;
        this.gameState.difficultyLevel++;
        const newDifficulty = this.DIFFICULTY_LEVELS[this.currentDifficultyIndex];
        if (newDifficulty) {
          this.debugLog('Level up', { level: this.gameState.difficultyLevel, difficulty: newDifficulty.wordDifficulty });
        }
        this.levelUpAnimationTimer = this.LEVEL_UP_ANIMATION_DURATION;
        soundManager.playLevelUpSound();
      }
    }
  }

  private updateSpawnTimer(deltaTime: number): void {
    this.spawnTimer += deltaTime;
    const currentDifficulty = this.DIFFICULTY_LEVELS[this.currentDifficultyIndex];
    if (currentDifficulty && this.spawnTimer >= currentDifficulty.spawnRate) {
      this.spawnWord();
      this.spawnTimer = 0;
    }
  }

  private spawnWord(): void {
    const currentDifficulty = this.DIFFICULTY_LEVELS[this.currentDifficultyIndex];
    if (!currentDifficulty) return;

    const words = wordsByDifficulty[currentDifficulty.wordDifficulty];
    if (!words || words.length === 0) return;

    const text = words[Math.floor(Math.random() * words.length)];
    if (!text) return;

    const position = this.getSpawnPosition();
    const speed = this.INITIAL_WORD_SPEED * currentDifficulty.speedMultiplier;

    const word: WordEntity = {
      id: Math.random().toString(36).substring(2, 11),
      text: text,
      x: position.x,
      y: position.y,
      speed,
      typedChars: 0,
      isDestroyed: false,
      spawnAnimationProgress: 0,
      isSpawning: true
    };

    this.words.push(word);
    this.debugLog('Word spawned', { text, difficulty: currentDifficulty.wordDifficulty, x: position.x, y: position.y });
  }

  private getSpawnPosition(): { x: number; y: number } {
    const edge = Math.floor(Math.random() * 4);
    const padding = 100 * this.scaleFactor;
    const width = this.canvas?.width || this.CANVAS_WIDTH;
    const height = this.canvas?.height || this.CANVAS_HEIGHT;

    switch (edge) {
      case 0: return { x: Math.random() * width, y: -padding }; // Top
      case 1: return { x: width + padding, y: Math.random() * height }; // Right
      case 2: return { x: Math.random() * width, y: height + padding }; // Bottom
      case 3: return { x: -padding, y: Math.random() * height }; // Left
      default: return { x: 0, y: 0 };
    }
  }

  private updateWords(deltaTime: number): void {
    const width = this.canvas?.width || this.CANVAS_WIDTH;
    const height = this.canvas?.height || this.CANVAS_HEIGHT;
    const centerX = width / 2;
    const centerY = height / 2;
    const hitRadius = 30 * this.scaleFactor;

    this.words.forEach(word => {
      if (word.isDestroyed) return;

      if (word.isSpawning) {
        word.spawnAnimationProgress += deltaTime / 2000;
        if (word.spawnAnimationProgress >= 1) {
          word.isSpawning = false;
        }
      }

      // Calculate direction to center
      const dx = centerX - word.x;
      const dy = centerY - word.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Move towards center (scale speed with canvas size)
      if (distance > 0) {
        const speedPixelsPerSecond = word.speed * this.scaleFactor * (deltaTime / 1000);
        word.x += (dx / distance) * speedPixelsPerSecond;
        word.y += (dy / distance) * speedPixelsPerSecond;
      }

      // Check if word reached center
      if (distance < hitRadius) {
        this.gameState.health -= 10;
        this.createExplosion(word.x, word.y, this.COLORS.neonPink);
        soundManager.playDamageSound();
        this.screenShakeTimer = this.SCREEN_SHAKE_DURATION;
        this.screenShakeIntensity = this.SCREEN_SHAKE_MAX_INTENSITY;
        word.isDestroyed = true;
        this.debugLog('Word reached center', { text: word.text, health: this.gameState.health });

        // Reset active word if this was the one being typed
        if (this.currentActiveWord === word) {
          this.currentActiveWord = null;
        }

        if (this.gameState.health <= 0) {
          this.gameState.health = 0;
          this.gameState.isGameOver = true;
          this.debugLog('Game over', { finalScore: this.gameState.score, wordsDestroyed: this.gameState.wordsDestroyed });
        }
      }
    });

    // Remove destroyed words
    this.words = this.words.filter(word => !word.isDestroyed);
  }

  private updateParticles(deltaTime: number): void {
    this.particles.forEach(particle => {
      particle.x += particle.vx * (deltaTime / 1000);
      particle.y += particle.vy * (deltaTime / 1000);
      particle.life -= deltaTime;

      particle.vx *= 0.95;
      particle.vy *= 0.95;
    });

    this.particles = this.particles.filter(particle => particle.life > 0);
  }

  // ===========================================
  // RENDERING
  // ===========================================

  private render(): void {
    if (!this.ctx || !this.canvas) return;

    // Apply screen shake
    let offsetX = 0;
    let offsetY = 0;
    if (this.screenShakeIntensity > 0.1) {
      offsetX = (Math.random() - 0.5) * this.screenShakeIntensity * 2;
      offsetY = (Math.random() - 0.5) * this.screenShakeIntensity * 2;
    }

    // Clear canvas with shake offset
    this.ctx.setTransform(1, 0, 0, 1, offsetX, offsetY);
    this.ctx.fillStyle = '#0D0221';
    this.ctx.fillRect(-offsetX, -offsetY, this.canvas.width, this.canvas.height);

    // Draw background grid
    this.drawBackground();

    // Draw center point (player)
    this.drawPlayer();

    // Draw words
    this.words.forEach(word => this.drawWord(word));

    // Draw particles
    this.particles.forEach(particle => this.drawParticle(particle));

    // Draw pause overlay
    if (this.isPaused) {
      this.drawPauseOverlay();
    }

    // Draw level up effect
    this.drawLevelUpEffect();

    // Reset transform
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  private drawPauseOverlay(): void {
    if (!this.ctx || !this.canvas) return;

    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // PAUSED text
    this.ctx.font = `bold ${48 * this.scaleFactor}px monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = this.COLORS.neonPink;
    this.ctx.fillStyle = this.COLORS.neonPink;
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);

    // Press ESC to continue
    this.ctx.font = `${20 * this.scaleFactor}px monospace`;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = this.COLORS.neonBlue;
    this.ctx.fillStyle = this.COLORS.neonBlue;
    this.ctx.fillText('Press ESC to continue', this.canvas.width / 2, this.canvas.height / 2 + 50 * this.scaleFactor);

    this.ctx.shadowBlur = 0;
  }

  private drawPlayer(): void {
    if (!this.ctx || !this.canvas) return;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const pulse = Math.sin(this.playerAnimationTime * 3) * 2;
    const radius = (15 + pulse) * this.scaleFactor;

    // Determine color (red if wrong key flash active)
    const isFlashing = this.wrongKeyFlashTimer > 0;
    const playerColor = isFlashing ? this.COLORS.neonPink : this.COLORS.neonBlue;
    const shadowColor = isFlashing ? this.COLORS.neonPink : this.COLORS.neonBlue;

    // Glow effect (intense if flashing)
    this.ctx.shadowBlur = isFlashing ? 40 * this.scaleFactor : 20 * this.scaleFactor;
    this.ctx.shadowColor = shadowColor;

    // Draw circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = playerColor;
    this.ctx.fill();

    // Add red glow ring if flashing
    if (isFlashing) {
      const flashIntensity = this.wrongKeyFlashTimer / this.WRONG_KEY_FLASH_DURATION;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius * (1 + flashIntensity * 0.5), 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(255, 0, 0, ${flashIntensity})`;
      this.ctx.lineWidth = 3 * this.scaleFactor;
      this.ctx.stroke();
    }

    this.ctx.shadowBlur = 0;
  }

  private drawLevelUpEffect(): void {
    if (!this.ctx || !this.canvas || this.levelUpAnimationTimer <= 0) return;

    const progress = 1 - (this.levelUpAnimationTimer / this.LEVEL_UP_ANIMATION_DURATION);
    const alpha = Math.max(0, 1 - progress);

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 4;

    const fontSize = 80 * this.scaleFactor;
    this.ctx.font = `bold ${fontSize}px monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const levelText = `LEVEL ${this.gameState.difficultyLevel}`;

    this.ctx.shadowBlur = 30 * this.scaleFactor;
    this.ctx.shadowColor = this.COLORS.neonYellow;
    this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
    this.ctx.fillText(levelText, centerX, centerY);

    this.ctx.shadowBlur = 0;
  }

  private drawBackground(): void {
    if (!this.ctx || !this.canvas) return;

    // Draw grid lines
    this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.1)';
    this.ctx.lineWidth = 1;

    const gridSize = 50 * this.scaleFactor;

    for (let x = 0; x <= this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  private drawWord(word: WordEntity): void {
    if (!this.ctx) return;

    let scale = 1;
    let alpha = 1;

    if (word.isSpawning) {
      const t = word.spawnAnimationProgress;
      const easeOut = 1 - Math.pow(1 - t, 3);
      scale = 0.5 + (0.5 * easeOut);
      alpha = easeOut;
    }

    this.ctx.globalAlpha = alpha;
    this.ctx.font = `bold ${24 * this.scaleFactor * scale}px monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const width = this.canvas?.width || this.CANVAS_WIDTH;
    const height = this.canvas?.height || this.CANVAS_HEIGHT;
    const centerX = width / 2;
    const centerY = height / 2;
    const dx = centerX - word.x;
    const dy = centerY - word.y;
    const distanceToCenter = Math.sqrt(dx * dx + dy * dy);

    const glowIntensity = Math.max(5, Math.min(30, 30 - (distanceToCenter / 500) * 25));

    // Draw typed portion
    const typedText = word.text.substring(0, word.typedChars);
    const remainingText = word.text.substring(word.typedChars);

    const typedWidth = this.ctx.measureText(typedText).width;
    const totalWidth = this.ctx.measureText(word.text).width;

    const startX = word.x - totalWidth / 2;

    // Typed portion (green)
    this.ctx.shadowBlur = glowIntensity * this.scaleFactor;
    this.ctx.shadowColor = this.COLORS.neonGreen;
    this.ctx.fillStyle = this.COLORS.neonGreen;
    this.ctx.fillText(typedText, startX + typedWidth / 2, word.y);

    // Remaining portion (white)
    this.ctx.shadowBlur = glowIntensity * this.scaleFactor;
    this.ctx.shadowColor = this.COLORS.white;
    this.ctx.fillStyle = this.COLORS.white;
    this.ctx.fillText(remainingText, startX + typedWidth + this.ctx.measureText(remainingText).width / 2, word.y);

    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
  }

  private drawParticle(particle: Particle): void {
    if (!this.ctx) return;

    const alpha = particle.life / particle.maxLife;
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size * this.scaleFactor, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }

  // ===========================================
  // INPUT HANDLING
  // ===========================================

  private getDistanceToCenter(word: WordEntity): number {
    const width = this.canvas?.width || this.CANVAS_WIDTH;
    const height = this.canvas?.height || this.CANVAS_HEIGHT;
    const centerX = width / 2;
    const centerY = height / 2;
    const dx = centerX - word.x;
    const dy = centerY - word.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public handleKeyPress(key: string): void {
    if (this.gameState.isGameOver) return;

    this.debugLog('Key pressed', { key, activeWord: this.currentActiveWord?.text });

    // If we have an active word, check if the key matches the next character
    if (this.currentActiveWord && !this.currentActiveWord.isDestroyed) {
      const nextChar = this.currentActiveWord.text[this.currentActiveWord.typedChars];
      if (nextChar && nextChar.toLowerCase() === key.toLowerCase()) {
        // Correct key - continue typing the current active word
        this.currentActiveWord.typedChars++;
        this.checkWordCompletion(this.currentActiveWord);
        soundManager.playTypingSound();
        return;
      } else {
        // Wrong key - trigger flash
        this.wrongKeyFlashTimer = this.WRONG_KEY_FLASH_DURATION;
        this.debugLog('Wrong key pressed on active word', { key, expected: nextChar });
        return;
      }
    }

    // No active word, find all words starting with this key (not already typed)
    const candidates = this.words.filter(word => {
      if (word.typedChars > 0) return false; // Skip words that are already being typed
      const firstChar = word.text[0];
      return firstChar && firstChar.toLowerCase() === key.toLowerCase();
    });

    if (candidates.length > 0) {
      // Sort by distance to center (closest first)
      candidates.sort((a, b) => this.getDistanceToCenter(a) - this.getDistanceToCenter(b));
      
      const selectedWord = candidates[0]!;
      this.currentActiveWord = selectedWord;
      this.currentActiveWord.typedChars++;
      this.checkWordCompletion(this.currentActiveWord);
      soundManager.playTypingSound();
      this.debugLog('Selected new active word', { word: this.currentActiveWord.text, candidates: candidates.length, distance: this.getDistanceToCenter(this.currentActiveWord) });
    } else {
      // No matching word - wrong key
      this.wrongKeyFlashTimer = this.WRONG_KEY_FLASH_DURATION;
      this.debugLog('No matching word for key', { key });
    }
  }

  private checkWordCompletion(word: WordEntity): void {
    if (word.typedChars >= word.text.length) {
      // Word completed
      this.createExplosion(word.x, word.y, this.COLORS.neonGreen);
      soundManager.playExplosionSound();
      word.isDestroyed = true;
      this.gameState.score += this.SCORE_PER_WORD + (word.text.length * this.SCORE_PER_CHARACTER);
      this.gameState.wordsDestroyed++;
      this.debugLog('Word completed', { text: word.text, score: this.gameState.score });

      // Reset active word if this was the one being typed
      if (this.currentActiveWord === word) {
        this.currentActiveWord = null;
      }
    }
  }

  private createExplosion(x: number, y: number, color: string): void {
    for (let i = 0; i < this.PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 / this.PARTICLE_COUNT) * i;
      const speedMultiplier = Math.random() * 2 + 0.5;
      const speed = (Math.random() * 200 + 100) * speedMultiplier;
      const size = Math.random() * 4 + 1;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: this.PARTICLE_LIFETIME,
        maxLife: this.PARTICLE_LIFETIME,
        color,
        size
      });
    }
  }

  // ===========================================
  // PUBLIC GETTERS
  // ===========================================

  public getGameState(): GameState {
    return { ...this.gameState };
  }
}
