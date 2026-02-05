import type { WordDifficulty } from '../game/types';

export const wordsByDifficulty: Record<WordDifficulty, string[]> = {
  // Easy (3-4 chars) - 100 words
  easy: [
    'cat', 'dog', 'run', 'jump', 'red', 'blue', 'sky', 'sun',
    'box', 'toy', 'key', 'car', 'bus', 'map', 'cup', 'pen',
    'hat', 'bag', 'fox', 'owl', 'bat', 'ant', 'bee', 'fly',
    'day', 'night', 'moon', 'star', 'tree', 'bird', 'fish', 'sand',
    'wind', 'fire', 'ice', 'gold', 'ring', 'book', 'desk', 'lamp',
    'clock', 'bell', 'door', 'wall', 'floor', 'hand', 'foot', 'face',
    'head', 'eye', 'nose', 'mouth', 'ear', 'coat', 'dress', 'shirt',
    'pants', 'sock', 'boot', 'shoe', 'duck', 'frog', 'tiger',
    'lion', 'bear', 'wolf', 'zebra', 'horse', 'camel', 'giraffe', 'panda',
    'rabbit', 'mouse', 'turtle', 'snake', 'crab', 'lobster', 'shrimp', 'octopus',
    'dolphin', 'whale', 'shark', 'penguin', 'kiwi', 'emu', 'ostrich', 'peacock'
  ],

  // Medium (5-6 chars) - 75 words
  medium: [
    'apple', 'table', 'water', 'house', 'chair', 'cloud', 'grass', 'happy',
    'music', 'light', 'night', 'dream', 'beach', 'mount', 'space', 'star',
    'river', 'forest', 'ocean', 'desert', 'valley', 'canyon', 'island', 'snow',
    'bread', 'pizza', 'burger', 'fries', 'sushi', 'salad', 'soup', 'cake',
    'coffee', 'tea', 'milk', 'juice', 'wine', 'beer', 'french', 'chinese',
    'american', 'japanese', 'indian', 'italian', 'mexican', 'spanish', 'russian',
    'german', 'portuguese', 'dutch', 'swedish', 'norwegian',
    'finnish', 'danish', 'polish', 'czech', 'hungarian', 'romanian', 'bulgarian',
    'greek', 'turkish', 'arabic', 'hebrew', 'korean', 'vietnamese', 'thai'
  ],

  // Hard (7-9 chars) - 40 words
  hard: [
    'computer', 'elephant', 'mountain', 'adventure', 'chocolate', 'telephone',
    'butterfly', 'purple', 'orange', 'yellow', 'green'
  ],

  // Expert (10+ chars) - 20 words
  expert: [
    'programming', 'astronomy', 'mathematics', 'python', 'javascript', 'typescript',
    'react', 'vue', 'angular', 'nodejs', 'reactjs', 'vuejs', 'angulajs', 'nodemon',
    'webpack', 'vite', 'babel'
  ]
};
