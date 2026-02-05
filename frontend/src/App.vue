<script setup lang="ts">
import { ref } from 'vue';
import { GameScreenState } from '../../shared/types';
import StartScreen from './components/StartScreen.vue';
import GameCanvas from './components/GameCanvas.vue';
import GameOver from './components/GameOver.vue';

const screenState = ref<GameScreenState>(GameScreenState.START_SCREEN);
const gameState = ref({
  health: 100,
  score: 0,
  wordsDestroyed: 0,
  timeSurvived: 0,
  difficultyLevel: 1,
  isGameOver: false
});

const startGame = () => {
  gameState.value = {
    health: 100,
    score: 0,
    wordsDestroyed: 0,
    timeSurvived: 0,
    difficultyLevel: 1,
    isGameOver: false
  };
  screenState.value = GameScreenState.GAME_PLAYING;
};

const handleGameOver = (state: typeof gameState.value) => {
  gameState.value = state;
  screenState.value = GameScreenState.GAME_OVER;
};

const handleStateUpdate = (state: typeof gameState.value) => {
  gameState.value = state;
};

const restartGame = () => {
  screenState.value = GameScreenState.START_SCREEN;
};
</script>

<template>
  <div class="w-screen h-screen bg-cyberpunk-darkerBackground overflow-hidden">
    <!-- Start Screen -->
    <Transition name="fade">
      <StartScreen
        v-if="screenState === GameScreenState.START_SCREEN"
        @start="startGame"
      />
    </Transition>

    <!-- Game Container (always present when not on start screen) -->
    <Transition name="fade">
      <div 
        v-if="screenState !== GameScreenState.START_SCREEN" 
        class="w-full h-full relative"
      >
        <!-- Game Canvas -->
        <GameCanvas
          :health="gameState.health"
          :score="gameState.score"
          :time-survived="gameState.timeSurvived"
          :difficulty-level="gameState.difficultyLevel"
          :is-game-over="screenState === GameScreenState.GAME_OVER"
          @game-over="handleGameOver"
          @state-update="handleStateUpdate"
        />

        <!-- Game Over Overlay - Fixed position over entire screen -->
        <Transition name="modal">
          <GameOver
            v-if="screenState === GameScreenState.GAME_OVER"
            :final-score="gameState.score"
            :words-destroyed="gameState.wordsDestroyed"
            :time-survived="gameState.timeSurvived"
            :difficulty-level="gameState.difficultyLevel"
            @restart="restartGame"
          />
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: 'Courier New', monospace;
  background-color: #050111;
  overflow: hidden;
}

/* Screen transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal overlay transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Scanline effect */
.scanlines::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0),
    rgba(255,255,255,0) 50%,
    rgba(0,0,0,0.1) 50%,
    rgba(0,0,0,0.1)
  );
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 10;
}
</style>
