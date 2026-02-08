<template>
  <div class="absolute inset-0 overflow-hidden">
    <canvas
      ref="canvasRef"
      class="absolute inset-0 w-full h-full"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Configuration
const HEX_SIZE = 36;
const GLOW_COLORS = ['#00FFFF', '#FF00FF']; // Cyan, Pink
const BASE_COLOR = 'rgba(0, 255, 255, 0.1)';
const FPS = 30;
const FRAME_TIME = 1000 / FPS;
const MAX_ACTIVE_GLOWS = 12;
const GLOW_DURATION_MIN_FRAMES = 45; // ~1.5 seconds
const GLOW_DURATION_MAX_FRAMES = 90; // ~3 seconds

interface Hexagon {
  x: number;
  y: number;
  col: number;
  row: number;
  glowIntensity: number;
  glowColor: string;
}

interface ActiveGlow {
  hex: Hexagon;
  frameCount: number;
  duration: number;
  color: string;
}

class HexagonBackground {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private hexagons: Hexagon[] = [];
  private activeGlows: ActiveGlow[] = [];
  private animationId: number | null = null;
  private lastFrameTime = 0;
  private width = 0;
  private height = 0;
  private hexWidth = 0;
  private hexHeight = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
    
    // Calculate hex dimensions for flat-top hexagons
    this.hexWidth = HEX_SIZE * 2;
    this.hexHeight = Math.sqrt(3) * HEX_SIZE;
    
    this.resize();
    this.start();
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.generateGrid();
  }

  private generateGrid(): void {
    this.hexagons = [];
    
    // For flat-top hexagons (horizontal rows):
    // - Width of hexagon = 2 * size
    // - Horizontal distance between centers = 1.5 * size (3/4 of width)
    // - Vertical distance between rows = sqrt(3) * size (full height)
    const horizontalStep = 1.5 * HEX_SIZE;
    const verticalStep = Math.sqrt(3) * HEX_SIZE;
    
    const cols = Math.ceil(this.width / horizontalStep) + 2;
    const rows = Math.ceil(this.height / verticalStep) + 2;
    
    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        // For flat-top hexes, offset every other COLUMN vertically
        const yOffset = (col % 2) * (verticalStep * 0.5);
        const x = col * horizontalStep;
        const y = row * verticalStep + yOffset;
        
        this.hexagons.push({
          x,
          y,
          col,
          row,
          glowIntensity: 0,
          glowColor: GLOW_COLORS[0]
        });
      }
    }
  }

  private getNeighborHexes(hex: Hexagon): Hexagon[] {
    // For flat-top hexagons with staggered columns
    const directions = hex.col % 2 === 0
      ? [[0, -1], [1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1]]  // even column
      : [[0, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];   // odd column
    
    const neighbors: Hexagon[] = [];
    for (const [dCol, dRow] of directions) {
      const neighbor = this.hexagons.find(h => 
        h.col === hex.col + dCol && h.row === hex.row + dRow
      );
      if (neighbor) neighbors.push(neighbor);
    }
    return neighbors;
  }

  private spawnGlow(): void {
    if (this.activeGlows.length >= MAX_ACTIVE_GLOWS) return;
    
    // Find hexes that aren't currently glowing
    const availableHexes = this.hexagons.filter(h => 
      !this.activeGlows.some(g => g.hex === h)
    );
    
    if (availableHexes.length === 0) return;
    
    // Prefer hexes near existing glows for connected patterns
    let seedHex: Hexagon | null = null;
    
    if (this.activeGlows.length > 0 && Math.random() < 0.65) {
      const existingGlow = this.activeGlows[Math.floor(Math.random() * this.activeGlows.length)];
      const neighbors = this.getNeighborHexes(existingGlow.hex);
      const availableNeighbors = neighbors.filter(h => 
        !this.activeGlows.some(g => g.hex === h)
      );
      
      if (availableNeighbors.length > 0) {
        seedHex = availableNeighbors[Math.floor(Math.random() * availableNeighbors.length)];
      }
    }
    
    if (!seedHex) {
      seedHex = availableHexes[Math.floor(Math.random() * availableHexes.length)];
    }
    
    const color = GLOW_COLORS[Math.floor(Math.random() * GLOW_COLORS.length)];
    
    this.activeGlows.push({
      hex: seedHex,
      frameCount: 0,
      duration: Math.floor(GLOW_DURATION_MIN_FRAMES + Math.random() * (GLOW_DURATION_MAX_FRAMES - GLOW_DURATION_MIN_FRAMES)),
      color
    });
  }

  private update(): void {
    // Spawn new glows randomly
    if (Math.random() < 0.04) {
      this.spawnGlow();
    }
    
    // Update active glows
    this.activeGlows = this.activeGlows.filter(glow => {
      glow.frameCount++;
      const progress = glow.frameCount / glow.duration;
      
      if (progress >= 1) {
        glow.hex.glowIntensity = 0;
        return false;
      }
      
      // Smooth fade in/out curve
      glow.hex.glowIntensity = Math.sin(progress * Math.PI);
      glow.hex.glowColor = glow.color;
      
      return true;
    });
  }

  private drawHexagon(x: number, y: number, radius: number, alpha: number, glowIntensity?: number, glowColor?: string): void {
    // Draw hexagon points
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = x + radius * Math.cos(angle);
      const hy = y + radius * Math.sin(angle);
      if (i === 0) {
        this.ctx.moveTo(hx, hy);
      } else {
        this.ctx.lineTo(hx, hy);
      }
    }
    this.ctx.closePath();
    
    if (glowIntensity && glowIntensity > 0 && glowColor) {
      // Glow layer
      this.ctx.save();
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 20 * glowIntensity;
      this.ctx.strokeStyle = glowColor;
      this.ctx.lineWidth = 2 + glowIntensity * 2;
      this.ctx.globalAlpha = 0.4 + 0.6 * glowIntensity;
      this.ctx.stroke();
      this.ctx.restore();
    } else {
      // Base layer
      this.ctx.strokeStyle = BASE_COLOR;
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = alpha;
      this.ctx.stroke();
    }
  }

  private draw(): void {
    // Clear with dark background
    this.ctx.fillStyle = '#050111';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw base grid
    for (const hex of this.hexagons) {
      this.drawHexagon(hex.x, hex.y, HEX_SIZE - 2, 0.6);
    }
    
    // Draw glow layer on top with additive blending
    this.ctx.globalCompositeOperation = 'screen';
    
    for (const glow of this.activeGlows) {
      this.drawHexagon(
        glow.hex.x, 
        glow.hex.y, 
        HEX_SIZE - 2,
        1,
        glow.hex.glowIntensity,
        glow.hex.glowColor
      );
    }
    
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private loop = (timestamp: number): void => {
    const elapsed = timestamp - this.lastFrameTime;
    
    if (elapsed >= FRAME_TIME) {
      this.lastFrameTime = timestamp - (elapsed % FRAME_TIME);
      this.update();
      this.draw();
    }
    
    this.animationId = requestAnimationFrame(this.loop);
  };

  start(): void {
    if (this.animationId === null) {
      this.lastFrameTime = performance.now();
      this.animationId = requestAnimationFrame(this.loop);
    }
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

let background: HexagonBackground | null = null;

onMounted(() => {
  if (canvasRef.value) {
    background = new HexagonBackground(canvasRef.value);
    
    const handleResize = () => background?.resize();
    window.addEventListener('resize', handleResize);
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
      background?.stop();
      background = null;
    });
  }
});

onUnmounted(() => {
  background?.stop();
  background = null;
});
</script>
