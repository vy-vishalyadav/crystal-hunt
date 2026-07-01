// Synthesizes retro-arcade 3D sound effects procedurally using Web Audio API

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  // Initialize context on first user interaction (browser policy requirement)
  _init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Synthesize M416 Gunshot (Noise + Low Pass Filter)
  playShoot() {
    try {
      this._init();
      if (this.muted) return;

      const bufferSize = this.ctx.sampleRate * 0.12; // 120ms duration
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Filter to make it sound punchy
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseSource.start();
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  }

  // Synthesize Reload click-clack sounds
  playReload() {
    try {
      this._init();
      if (this.muted) return;

      const now = this.ctx.currentTime;

      // First click (magazine out)
      this._playClick(now, 800, 0.05);

      // Second click (magazine in - 0.4s later)
      this._playClick(now + 0.4, 600, 0.06);

      // Third click (bolt pull - 0.9s later)
      this._playClick(now + 0.9, 1200, 0.04);
      this._playClick(now + 0.98, 900, 0.04);
    } catch (e) {
      console.warn(e);
    }
  }

  _playClick(time, freq, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + duration);

    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  // Synthesize crystal collection sound (ascending arpeggio)
  playCollect() {
    try {
      this._init();
      if (this.muted) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, index) => {
        const time = now + index * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.18);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Synthesize damage grunt (low frequency sweep)
  playDamage() {
    try {
      this._init();
      if (this.muted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {
      console.warn(e);
    }
  }

  // Synthesize zombie growl (noisy, low-frequency pitch modulation)
  playZombieGrowl() {
    try {
      this._init();
      if (this.muted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      // Create a growl vibration using low frequency oscillation (LFO)
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 16; // 16 Hz modulation
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 30; // pitch dev +/- 30Hz

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      lfo.start();
      osc.start();
      
      lfo.stop(this.ctx.currentTime + 0.6);
      osc.stop(this.ctx.currentTime + 0.6);
    } catch (e) {
      console.warn(e);
    }
  }
}
