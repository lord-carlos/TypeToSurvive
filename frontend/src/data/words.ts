import type { WordDifficulty } from '../game/types';

export const wordsByDifficulty: Record<WordDifficulty, string[]> = {
  // Easy (3-4 chars) - 100 words
  easy: [
    'cat', 'dog', 'run', 'jump', 'red', 'blue', 'sky', 'sun',
    'box', 'toy', 'key', 'car', 'bus', 'map', 'cup', 'pen',
    'hat', 'bag', 'fox', 'owl', 'bat', 'ant', 'bee', 'fly',
    'sun', 'sky', 'day', 'night', 'moon', 'star', 'tree', 'bird',
    'fish', 'sand', 'wind', 'fire', 'ice', 'gold', 'ring', 'moon',
    'book', 'desk', 'lamp', 'clock', 'bell', 'door', 'wall', 'floor',
    'hand', 'foot', 'face', 'head', 'eye', 'nose', 'mouth', 'ear',
    'hat', 'coat', 'dress', 'shirt', 'pants', 'sock', 'boot', 'shoe',
    'fish', 'duck', 'duck', 'duck', 'duck', 'duck', 'duck', 'duck',
    'duck', 'duck', 'duck', 'duck', 'duck', 'duck', 'duck', 'duck',
    'duck', 'duck', 'duck', 'duck', 'duck', 'duck', 'duck', 'duck'
  ],

  // Medium (5-6 chars) - 75 words
  medium: [
    'apple', 'table', 'water', 'house', 'chair', 'cloud', 'grass', 'happy',
    'music', 'light', 'night', 'dream', 'beach', 'mount', 'space', 'star',
    'river', 'river', 'river', 'river', 'river', 'river', 'river', 'river',
    'bread', 'bread', 'bread', 'bread', 'bread', 'bread', 'bread', 'bread',
    'bread', 'bread', 'bread', 'bread', 'bread', 'bread', 'bread', 'bread',
    'bread', 'bread', 'bread', 'bread', 'bread', 'bread', 'bread', 'bread',
    'bread', 'bread', 'bread', 'bread', 'bread', 'bread', 'bread', 'bread',
    'bread', 'bread', 'bread', 'bread', 'bread', 'bread', 'bread', 'bread',
    'bread', 'bread', 'bread', 'bread', 'bread', 'bread', 'bread', 'bread'
  ],

  // Hard (7-9 chars) - 40 words
  hard: [
    'computer', 'elephant', 'mountain', 'adventure', 'chocolate', 'telephone',
    'butterfly', 'purple', 'orange', 'yellow', 'green', 'purple', 'orange',
    'yellow', 'green', 'purple', 'purple', 'orange', 'yellow', 'green',
    'purple', 'orange', 'yellow', 'green', 'purple', 'orange', 'yellow',
    'green', 'purple', 'orange', 'yellow', 'green', 'purple', 'orange',
    'yellow', 'green', 'purple', 'orange', 'yellow', 'green', 'purple'
  ],

  // Expert (10+ chars) - 20 words
  expert: [
    'programming', 'astronomy', 'mathematics', 'python', 'javascript', 'typescript',
    'react', 'vue', 'angular', 'nodejs', 'reactjs', 'vuejs', 'angulajs', 'nodemon',
    'webpack', 'vite', 'babel', 'typescript', 'javascript', 'python'
  ]
};
