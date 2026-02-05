<template>
  <div class="w-full h-full bg-cyberpunk-darkerBackground relative">
    <!-- HUD Header - Absolutely positioned at top -->
    <header class="absolute top-0 left-0 right-0 bg-cyberpunk-panelBackground border-b-2 border-cyberpunk-border shadow-lg z-20">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between gap-4">
          <!-- Health Section -->
          <div class="flex-1 max-w-[300px]">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs text-cyberpunk-dimText uppercase tracking-wider">Health</span>
              <span class="text-sm font-bold" :class="healthTextColor">{{ gameState.health }}%</span>
            </div>
            <div class="h-3 bg-cyberpunk-darkerBackground rounded-full overflow-hidden border border-cyberpunk-border">
              <div
                class="h-full transition-all duration-300 ease-out relative"
                :class="healthBarColor"
                :style="{ width: `${gameState.health}%` }"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="flex items-center gap-6 md:gap-8">
            <div class="text-center">
              <p class="text-[10px] text-cyberpunk-dimText uppercase tracking-widest">Score</p>
              <p class="text-xl md:text-2xl font-bold text-cyberpunk-neonYellow font-mono tabular-nums">
                {{ gameState.score.toLocaleString() }}
              </p>
            </div>

            <div class="text-center">
              <p class="text-[10px] text-cyberpunk-dimText uppercase tracking-widest">Time</p>
              <p class="text-xl md:text-2xl font-bold text-cyberpunk-neonBlue font-mono tabular-nums">
                {{ formattedTime }}
              </p>
            </div>

            <div class="text-center">
              <p class="text-[10px] text-cyberpunk-dimText uppercase tracking-widest">Level</p>
              <p class="text-xl md:text-2xl font-bold text-cyberpunk-neonPink font-mono">
                {{ gameState.difficultyLevel }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Game Area - Fills the entire screen with padding for header/footer -->
    <main class="absolute top-[72px] left-0 right-0 bottom-[40px] flex items-center justify-center p-2 md:p-4">
      <!-- Decorative grid background -->
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute inset-0" style="background-image: linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>
      </div>

      <!-- Canvas Container -->
      <div 
        ref="canvasContainerRef" 
        class="relative w-full h-full flex items-center justify-center"
      >
        <canvas
          ref="canvasRef"
          class="border-2 border-cyberpunk-neonBlue rounded-lg shadow-neon-blue"
          :class="{ 'opacity-50': isPaused }"
          style="max-width: 100%; max-height: 100%;"
        ></canvas>

        <!-- Pause Overlay -->
        <Transition name="fade">
          <div 
            v-if="isPaused && !isGameOver" 
            class="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg z-30"
          >
            <div class="text-center">
              <h2 class="text-4xl md:text-6xl font-bold text-cyberpunk-neonPink mb-4 tracking-wider animate-pulse-glow">
                PAUSED
              </h2>
              <p class="text-cyberpunk-neonBlue text-lg md:text-xl">
                Press <kbd class="px-2 py-1 bg-cyberpunk-panelBackground rounded border border-cyberpunk-border text-sm">ESC</kbd> to resume
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </main>

    <!-- Footer Instructions - Absolutely positioned at bottom -->
    <footer class="absolute bottom-0 left-0 right-0 bg-cyberpunk-panelBackground border-t border-cyberpunk-border py-2 px-4 z-20">
      <div class="max-w-7xl mx-auto flex items-center justify-between text-xs md:text-sm">
        <p class="text-cyberpunk-dimText">
          <span class="text-cyberpunk-neonBlue">TIP:</span> Type the first letter of any word to start typing it
        </p>
        <p class="text-cyberpunk-dimText hidden md:block">
          <kbd class="px-2 py-0.5 bg-cyberpunk-darkerBackground rounded border border-cyberpunk-border">ESC</kbd> to pause
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { GameEngine } from '../composables/useGameEngine';
import type { GameState } from '../../../shared/types';

const props = defineProps<{
  health: number;
  score: number;
  timeSurvived: number;
  difficultyLevel: number;
  isGameOver: boolean;
}>();

const emit = defineEmits<{
  gameOver: [state: GameState];
  stateUpdate: [state: GameState];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasContainerRef = ref<HTMLDivElement | null>(null);
let gameEngine: GameEngine | null = null;
let stateUpdateInterval: number | null = null;
let resizeObserver: ResizeObserver | null = null;

const gameState = ref<GameState>({
  health: props.health,
  score: props.score,
  wordsDestroyed: 0,
  timeSurvived: props.timeSurvived,
  difficultyLevel: props.difficultyLevel,
  isGameOver: false,
});

const isPaused = ref(false);

const healthBarColor = computed(() => {
  if (gameState.value.health > 60) return 'bg-gradient-to-r from-cyberpunk-neonGreen to-green-400';
  if (gameState.value.health > 30) return 'bg-gradient-to-r from-cyberpunk-neonYellow to-yellow-400';
  return 'bg-gradient-to-r from-cyberpunk-neonPink to-red-500';
});

const healthTextColor = computed(() => {
  if (gameState.value.health > 60) return 'text-cyberpunk-neonGreen';
  if (gameState.value.health > 30) return 'text-cyberpunk-neonYellow';
  return 'text-cyberpunk-neonPink';
});

const formattedTime = computed(() => {
  const minutes = Math.floor(gameState.value.timeSurvived / 60);
  const seconds = Math.floor(gameState.value.timeSurvived % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const handleKeyPress = (e: KeyboardEvent): void => {
  // Handle ESC for pause
  if (e.key === 'Escape') {
    e.preventDefault();
    if (!props.isGameOver && gameEngine) {
      const paused = gameEngine.togglePause();
      isPaused.value = paused;
    }
    return;
  }

  // Ignore keys when paused or game over
  if (isPaused.value || props.isGameOver) return;

  if (e.key === 'Backspace') {
    e.preventDefault();
    return;
  }

  if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
    gameEngine?.handleKeyPress(e.key);
  }
};

// Watch for game over state changes
watch(() => props.isGameOver, (newValue) => {
  if (newValue) {
    isPaused.value = false;
  }
});

onMounted(() => {
  if (canvasRef.value && canvasContainerRef.value) {
    gameEngine = new GameEngine(canvasRef.value, (state) => {
      emit('gameOver', state);
    });

    // Initial resize
    const rect = canvasContainerRef.value.getBoundingClientRect();
    gameEngine.resize(rect.width, rect.height);
    gameEngine.start();

    // Set up resize observer for responsive canvas
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        gameEngine?.resize(width, height);
      }
    });
    resizeObserver.observe(canvasContainerRef.value);

    // State update interval
    stateUpdateInterval = window.setInterval(() => {
      if (gameEngine && !isPaused.value && !props.isGameOver) {
        gameState.value = gameEngine.getGameState();
        emit('stateUpdate', gameState.value);
      }
    }, 100);
  }

  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  gameEngine?.stop();
  if (stateUpdateInterval) {
    clearInterval(stateUpdateInterval);
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  window.removeEventListener('keydown', handleKeyPress);
});
</script>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

kbd {
  font-family: monospace;
}

canvas {
  display: block;
}
</style>
