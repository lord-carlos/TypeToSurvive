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
    { spawnRate: 2000, speedMultiplier: 1.0, wordDifficulty: 'easy' },
    { spawnRate: 1800, speedMultiplier: 1.2, wordDifficulty: 'medium' },
    { spawnRate: 1600, speedMultiplier: 1.4, wordDifficulty: 'medium' },
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
  }

  private checkLevelUp(deltaTime: number): void {
    this.difficultyTimer += deltaTime;
    if (this.difficultyTimer >= this.LEVEL_UP_INTERVAL * 1000) {
      this.difficultyTimer = 0;
      if (this.currentDifficultyIndex < this.DIFFICULTY_LEVELS.length - 1) {
        this.currentDifficultyIndex++;
        this.gameState.difficultyLevel++;
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
      isDestroyed: false
    };

    this.words.push(word);
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
        word.isDestroyed = true;

        // Reset active word if this was the one being typed
        if (this.currentActiveWord === word) {
          this.currentActiveWord = null;
        }

        if (this.gameState.health <= 0) {
          this.gameState.health = 0;
          this.gameState.isGameOver = true;
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

    // Clear canvas
    this.ctx.fillStyle = '#0D0221';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
    const radius = 15 * this.scaleFactor;

    // Glow effect
    this.ctx.shadowBlur = 20 * this.scaleFactor;
    this.ctx.shadowColor = this.COLORS.neonBlue;

    // Draw circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.COLORS.neonBlue;
    this.ctx.fill();

    this.ctx.shadowBlur = 0;
  }

  private drawWord(word: WordEntity): void {
    if (!this.ctx) return;

    this.ctx.font = `${24 * this.scaleFactor}px monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Draw typed portion
    const typedText = word.text.substring(0, word.typedChars);
    const remainingText = word.text.substring(word.typedChars);

    const typedWidth = this.ctx.measureText(typedText).width;
    const totalWidth = this.ctx.measureText(word.text).width;

    const startX = word.x - totalWidth / 2;

    // Typed portion (green)
    this.ctx.shadowBlur = 10 * this.scaleFactor;
    this.ctx.shadowColor = this.COLORS.neonGreen;
    this.ctx.fillStyle = this.COLORS.neonGreen;
    this.ctx.fillText(typedText, startX + typedWidth / 2, word.y);

    // Remaining portion (white)
    this.ctx.shadowBlur = 10 * this.scaleFactor;
    this.ctx.shadowColor = this.COLORS.white;
    this.ctx.fillStyle = this.COLORS.white;
    this.ctx.fillText(remainingText, startX + typedWidth + this.ctx.measureText(remainingText).width / 2, word.y);

    this.ctx.shadowBlur = 0;
  }

  private drawParticle(particle: Particle): void {
    if (!this.ctx) return;

    const alpha = particle.life / particle.maxLife;
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }

  // ===========================================
  // INPUT HANDLING
  // ===========================================

  public handleKeyPress(key: string): void {
    if (this.gameState.isGameOver) return;

    // If we have an active word, check if the key matches the next character
    if (this.currentActiveWord && !this.currentActiveWord.isDestroyed) {
      const nextChar = this.currentActiveWord.text[this.currentActiveWord.typedChars];
      if (nextChar && nextChar.toLowerCase() === key.toLowerCase()) {
        this.currentActiveWord.typedChars++;
        this.checkWordCompletion(this.currentActiveWord);
        soundManager.playTypingSound();
        return;
      }
    }

    // No active word or key doesn't match active word, find a new word starting with this key
    const newActiveWord = this.words.find(word => {
      if (word.typedChars > 0) return false; // Skip words that are already being typed
      const firstChar = word.text[0];
      return firstChar && firstChar.toLowerCase() === key.toLowerCase();
    });

    if (newActiveWord) {
      this.currentActiveWord = newActiveWord;
      newActiveWord.typedChars++;
      this.checkWordCompletion(newActiveWord);
      soundManager.playTypingSound();
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

      // Reset active word if this was the one being typed
      if (this.currentActiveWord === word) {
        this.currentActiveWord = null;
      }
    }
  }

  private createExplosion(x: number, y: number, color: string): void {
    for (let i = 0; i < this.PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 / this.PARTICLE_COUNT) * i;
      const speed = Math.random() * 200 + 100;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: this.PARTICLE_LIFETIME,
        maxLife: this.PARTICLE_LIFETIME,
        color
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
