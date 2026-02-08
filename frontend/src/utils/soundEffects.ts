class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private loaded: boolean = false;

  constructor() {
    this.initAudioContext();
    this.loadSounds();
  }

  private async initAudioContext(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private async loadSounds(): Promise<void> {
    if (this.loaded) return;

    await this.initAudioContext();

    if (!this.audioContext) return;

    const soundFiles = {
      explosion: '/assets/sounds/DeathFlash.flac',
      damage: '/assets/sounds/error.mp3',
      gameover: '/assets/sounds/gameover.wav',
      levelup: '/assets/sounds/levelup.mp3',
    };

    const loadPromises = Object.entries(soundFiles).map(async ([name, path]) => {
      try {
        if (!this.audioContext) return;
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.sounds.set(name, audioBuffer);
        console.log(`Loaded sound: ${name}`);
      } catch (error) {
        console.error(`Failed to load sound: ${name}`, error);
      }
    });

    await Promise.all(loadPromises);
    this.loaded = true;
  }

  private playSound(name: string, volume: number = 0.5): void {
    if (!this.audioContext || !this.sounds.has(name)) return;

    const buffer = this.sounds.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);
  }

  public playTypingSound(): void {
    if (!this.loaded) return;
    
    if (this.audioContext) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.05);
    }
  }

  public playExplosionSound(): void {
    this.playSound('explosion', 0.5);
  }

  public playDamageSound(): void {
    this.playSound('damage', 0.4);
  }

  public playGameOverSound(): void {
    this.playSound('gameover', 0.3);
  }

  public playLevelUpSound(): void {
    this.playSound('levelup', 0.5);
  }
}

export default new SoundManager();
