<template>
  <!-- Game Over Modal Overlay -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop - covers entire screen -->
    <div 
      class="absolute inset-0 bg-black/60 backdrop-blur-sm"
    ></div>

    <!-- Modal Card -->
    <div class="relative w-full max-w-lg bg-cyberpunk-panelBackground border-2 border-cyberpunk-neonPink rounded-xl shadow-neon-pink overflow-hidden">
      <!-- Corner Accents -->
      <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyberpunk-neonPink"></div>
      <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyberpunk-neonPink"></div>
      <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyberpunk-neonPink"></div>
      <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyberpunk-neonPink"></div>

      <!-- Header -->
      <div class="bg-gradient-to-r from-cyberpunk-neonPink/20 to-transparent p-6 border-b border-cyberpunk-neonPink/30">
        <h1 class="text-4xl md:text-5xl font-bold text-center text-cyberpunk-neonPink tracking-wider animate-pulse-glow">
          GAME OVER
        </h1>
        <p class="text-center text-cyberpunk-dimText mt-2 text-sm">System failure. Core compromised.</p>
      </div>

      <!-- Stats Grid -->
      <div class="p-6 grid grid-cols-2 gap-4">
        <div class="bg-cyberpunk-darkerBackground rounded-lg p-4 border border-cyberpunk-border hover:border-cyberpunk-neonYellow/50 transition-colors group">
          <p class="text-[10px] text-cyberpunk-dimText uppercase tracking-widest mb-1">Final Score</p>
          <p class="text-3xl md:text-4xl font-bold text-cyberpunk-neonYellow font-mono group-hover:drop-shadow-[0_0_8px_rgba(255,255,0,0.8)] transition-all">
            {{ finalScore.toLocaleString() }}
          </p>
        </div>

        <div class="bg-cyberpunk-darkerBackground rounded-lg p-4 border border-cyberpunk-border hover:border-cyberpunk-neonBlue/50 transition-colors group">
          <p class="text-[10px] text-cyberpunk-dimText uppercase tracking-widest mb-1">Words Destroyed</p>
          <p class="text-3xl md:text-4xl font-bold text-cyberpunk-neonBlue font-mono group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] transition-all">
            {{ wordsDestroyed }}
          </p>
        </div>

        <div class="bg-cyberpunk-darkerBackground rounded-lg p-4 border border-cyberpunk-border hover:border-cyberpunk-neonGreen/50 transition-colors group">
          <p class="text-[10px] text-cyberpunk-dimText uppercase tracking-widest mb-1">Time Survived</p>
          <p class="text-3xl md:text-4xl font-bold text-cyberpunk-neonGreen font-mono group-hover:drop-shadow-[0_0_8px_rgba(0,255,0,0.8)] transition-all">
            {{ formattedTime }}
          </p>
        </div>

        <div class="bg-cyberpunk-darkerBackground rounded-lg p-4 border border-cyberpunk-border hover:border-cyberpunk-neonPurple/50 transition-colors group">
          <p class="text-[10px] text-cyberpunk-dimText uppercase tracking-widest mb-1">Difficulty</p>
          <p class="text-3xl md:text-4xl font-bold text-cyberpunk-neonPurple font-mono group-hover:drop-shadow-[0_0_8px_rgba(157,0,255,0.8)] transition-all">
            {{ difficultyLevel }}
          </p>
        </div>
      </div>

      <!-- Name Input Section -->
      <div v-if="!submitted" class="px-6 pb-4">
        <label class="block text-xs text-cyberpunk-dimText uppercase tracking-wider mb-2">
          Enter your callsign
        </label>
        <div class="flex gap-2">
          <input
            v-model="playerName"
            type="text"
            maxlength="20"
            class="flex-1 p-3 bg-cyberpunk-darkerBackground border-2 border-cyberpunk-border rounded-lg text-cyberpunk-brightText placeholder-cyberpunk-dimText focus:outline-none focus:border-cyberpunk-neonBlue focus:shadow-neon-blue transition-all"
            placeholder="Your name..."
            @keyup.enter="submitScore"
          />
          <button
            @click="submitScore"
            :disabled="!playerName || submitting"
            class="px-6 py-3 bg-cyberpunk-neonPurple text-white font-bold rounded-lg hover:bg-cyberpunk-neonPurple/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider text-sm"
          >
            {{ submitting ? '...' : 'Submit' }}
          </button>
        </div>
      </div>

      <!-- Leaderboard Section -->
      <div v-if="showLeaderboard && leaderboard.length > 0" class="px-6 pb-4">
        <h2 class="text-lg font-bold mb-3 text-cyberpunk-neonBlue flex items-center gap-2">
          <span class="w-2 h-2 bg-cyberpunk-neonBlue rounded-full animate-pulse"></span>
          LEADERBOARD
        </h2>
        <div class="bg-cyberpunk-darkerBackground rounded-lg overflow-hidden border border-cyberpunk-border">
          <div
            v-for="(entry, index) in leaderboard"
            :key="entry.id"
            class="flex justify-between items-center p-3 border-b border-cyberpunk-border last:border-b-0 hover:bg-cyberpunk-panelBackground/50 transition-colors"
            :class="{ 'bg-cyberpunk-neonPurple/10': index < 3 }"
          >
            <div class="flex items-center gap-3">
              <span class="text-xl font-bold w-8" :class="getRankColor(index)">
                {{ index + 1 }}
              </span>
              <span class="text-cyberpunk-brightText font-medium">{{ entry.playerName }}</span>
            </div>
            <span class="text-cyberpunk-neonYellow font-bold font-mono">{{ entry.score.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="p-6 pt-2 border-t border-cyberpunk-border bg-cyberpunk-darkerBackground/50">
        <button
          @click="restart"
          class="w-full py-4 bg-gradient-to-r from-cyberpunk-neonGreen to-green-500 text-cyberpunk-darkerBackground font-bold rounded-lg hover:shadow-neon-green hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wider text-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Score } from '../../../shared/types';

const props = defineProps<{
  finalScore: number;
  wordsDestroyed: number;
  timeSurvived: number;
  difficultyLevel: number;
}>();

const emit = defineEmits<{
  restart: [];
}>();

const playerName = ref('');
const submitted = ref(false);
const submitting = ref(false);
const showLeaderboard = ref(false);
const leaderboard = ref<Score[]>([]);

const formattedTime = computed(() => {
  const minutes = Math.floor(props.timeSurvived / 60);
  const seconds = Math.floor(props.timeSurvived % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const getRankColor = (index: number): string => {
  switch (index) {
    case 0: return 'text-cyberpunk-neonYellow';
    case 1: return 'text-gray-300';
    case 2: return 'text-orange-400';
    default: return 'text-cyberpunk-dimText';
  }
};

const submitScore = async () => {
  if (!playerName.value || submitting.value) return;

  submitting.value = true;

  try {
    const response = await fetch('http://localhost:3001/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerName: playerName.value,
        score: props.finalScore,
        wordsDestroyed: props.wordsDestroyed,
        timeSurvived: Math.floor(props.timeSurvived),
        difficultyLevel: props.difficultyLevel,
      }),
    });

    if (response.ok) {
      submitted.value = true;
      localStorage.setItem('playerName', playerName.value);
      await fetchLeaderboard();
    } else {
      console.error('Failed to submit score');
    }
  } catch (error) {
    console.error('Error submitting score:', error);
  } finally {
    submitting.value = false;
  }
};

const fetchLeaderboard = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/leaderboard');
    if (response.ok) {
      leaderboard.value = await response.json();
      showLeaderboard.value = true;
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
};

const restart = () => {
  emit('restart');
};

onMounted(() => {
  const savedName = localStorage.getItem('playerName');
  if (savedName) {
    playerName.value = savedName;
  }
});
</script>
