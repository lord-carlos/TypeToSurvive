<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-cyberpunk-darkerBackground relative overflow-hidden">
    <!-- Hexagon Background -->
    <HexagonBackground />

    <!-- Vignette Effect -->
    <div class="absolute inset-0 bg-radial-gradient pointer-events-none" style="background: radial-gradient(circle at center, transparent 0%, rgba(5,1,17,0.8) 100%);"></div>

    <!-- Main Content Container -->
    <div class="relative z-10 w-full max-w-4xl px-4">
      <!-- Logo/Title Section -->
      <div class="text-center mb-8 md:mb-12">
        <!-- Decorative Lines -->
        <div class="flex items-center justify-center gap-4 mb-4">
          <div class="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-cyberpunk-neonPink"></div>
          <div class="w-2 h-2 bg-cyberpunk-neonPink rotate-45 animate-pulse"></div>
          <div class="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-cyberpunk-neonPink"></div>
        </div>

        <!-- Title -->
        <h1 class="relative">
          <span class="block text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-cyberpunk-neonPink to-cyberpunk-neonPurple animate-flicker" style="text-shadow: 0 0 30px rgba(255,0,255,0.5), 0 0 60px rgba(255,0,255,0.3);">
            TYPE TO
          </span>
          <span class="block text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-cyberpunk-neonBlue via-white to-cyberpunk-cyan animate-pulse-glow" style="text-shadow: 0 0 30px rgba(0,255,255,0.5), 0 0 60px rgba(0,255,255,0.3);">
            SURVIVE
          </span>
        </h1>

        <!-- Subtitle -->
        <p class="mt-4 text-lg md:text-xl text-cyberpunk-dimText tracking-widest uppercase">
          <span class="text-cyberpunk-neonBlue">Neural</span> Defense System // v2.0.77
        </p>

        <!-- Decorative Lines -->
        <div class="flex items-center justify-center gap-4 mt-4">
          <div class="h-px w-12 md:w-20 bg-gradient-to-r from-transparent to-cyberpunk-neonBlue"></div>
          <div class="w-1.5 h-1.5 bg-cyberpunk-neonBlue rotate-45"></div>
          <div class="h-px w-12 md:w-20 bg-gradient-to-l from-transparent to-cyberpunk-neonBlue"></div>
        </div>
      </div>

      <!-- Start Command Section -->
      <div class="bg-cyberpunk-panelBackground/80 backdrop-blur-sm border border-cyberpunk-border rounded-xl p-6 md:p-8 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
        <!-- Corner Accents -->
        <div class="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyberpunk-neonBlue"></div>
        <div class="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyberpunk-neonBlue"></div>
        <div class="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyberpunk-neonBlue"></div>
        <div class="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyberpunk-neonBlue"></div>

        <!-- Command Header -->
        <div class="text-center mb-6">
          <p class="text-cyberpunk-neonBlue text-sm uppercase tracking-[0.3em] mb-2">Initialize System</p>
          <div class="flex items-center justify-center gap-2">
            <div class="h-px flex-1 max-w-16 bg-cyberpunk-border"></div>
            <span class="text-cyberpunk-dimText text-xs">Type command to proceed</span>
            <div class="h-px flex-1 max-w-16 bg-cyberpunk-border"></div>
          </div>
        </div>

        <!-- Typing Display -->
        <div class="flex justify-center mb-6">
          <div class="inline-flex items-center gap-1 md:gap-2 bg-cyberpunk-darkerBackground rounded-lg p-4 border border-cyberpunk-border">
            <span
              v-for="(char, index) in 'START'"
              :key="index"
              class="text-3xl md:text-5xl font-mono font-bold w-10 md:w-14 h-12 md:h-16 flex items-center justify-center rounded transition-all duration-200"
              :class="{
                'bg-cyberpunk-neonGreen/20 text-cyberpunk-neonGreen border border-cyberpunk-neonGreen shadow-neon-green scale-110': index < input.length,
                'bg-cyberpunk-darkerBackground text-cyberpunk-dimText border border-cyberpunk-border': index >= input.length,
                'animate-pulse': index === input.length
              }"
            >
              {{ char }}
            </span>
          </div>
        </div>

        <!-- Progress Indicator -->
        <div v-if="input" class="flex items-center justify-center gap-2 text-cyberpunk-neonGreen">
          <div class="w-2 h-2 bg-cyberpunk-neonGreen rounded-full animate-pulse"></div>
          <span class="font-mono text-lg">{{ input }}</span>
          <div class="w-2 h-2 bg-cyberpunk-neonGreen rounded-full animate-pulse"></div>
        </div>

        <!-- Status Bar -->
        <div class="mt-6 pt-4 border-t border-cyberpunk-border">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-cyberpunk-neonGreen animate-pulse"></div>
              <span class="text-cyberpunk-dimText">System Ready</span>
            </div>
            <div class="text-cyberpunk-dimText font-mono">
              MEM: <span class="text-cyberpunk-neonBlue">OK</span> | CPU: <span class="text-cyberpunk-neonBlue">OK</span> | NET: <span class="text-cyberpunk-neonBlue">CONNECTED</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions Section -->
      <div class="mt-8 max-w-2xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(instruction, index) in instructions" :key="index" class="flex items-start gap-3 bg-cyberpunk-panelBackground/50 backdrop-blur-sm p-4 rounded-lg border border-cyberpunk-border/50 hover:border-cyberpunk-neonBlue/50 transition-all group">
            <div class="w-8 h-8 rounded-full bg-cyberpunk-darkerBackground border border-cyberpunk-border flex items-center justify-center shrink-0 group-hover:border-cyberpunk-neonBlue group-hover:text-cyberpunk-neonBlue transition-all">
              <span class="text-xs font-bold">{{ index + 1 }}</span>
            </div>
            <div>
              <p class="text-cyberpunk-brightText text-sm font-medium">{{ instruction.title }}</p>
              <p class="text-cyberpunk-dimText text-xs mt-1">{{ instruction.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-12 text-center">
        <p class="text-cyberpunk-dimText text-xs uppercase tracking-widest">
          <span class="text-cyberpunk-neonPink">WARNING:</span> High neural activity detected
        </p>
      </div>
    </div>

    <!-- Decorative Side Elements -->
    <div class="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2">
      <div v-for="n in 5" :key="n" class="w-1 h-8 rounded-full bg-cyberpunk-neonBlue/30" :class="{ 'bg-cyberpunk-neonBlue animate-pulse': n === 3 }"></div>
    </div>
    <div class="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2">
      <div v-for="n in 5" :key="n" class="w-1 h-8 rounded-full bg-cyberpunk-neonPink/30" :class="{ 'bg-cyberpunk-neonPink animate-pulse': n === 3 }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import HexagonBackground from './HexagonBackground.vue';

const emit = defineEmits<{
  start: [];
}>();

const input = ref('');
const TARGET_WORD = 'START';

const instructions = [
  { title: 'Hostile Entities', desc: 'Words will spawn from all directions' },
  { title: 'Neutralize', desc: 'Type words completely to destroy them' },
  { title: 'Core Defense', desc: 'Don\'t let words reach the center' },
  { title: 'Survival', desc: 'Endure as long as possible' },
];

const handleKeyPress = (e: KeyboardEvent): void => {
  if (e.key === 'Backspace') {
    input.value = input.value.slice(0, -1);
  } else if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
    const newInput = input.value + e.key.toUpperCase();
    if (newInput.length <= TARGET_WORD.length) {
      input.value = newInput;

      if (newInput === TARGET_WORD) {
        setTimeout(() => {
          emit('start');
        }, 400);
      }
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});
</script>

<style scoped>
.bg-radial-gradient {
  background: radial-gradient(circle at center, transparent 0%, rgba(5, 1, 17, 0.9) 100%);
}
</style>
