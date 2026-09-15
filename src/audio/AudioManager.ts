import { Persistence } from '../state/Persistence';

/**
 * All sound is synthesized with the Web Audio API - no audio files, no copyrighted music.
 * The AudioContext is created lazily on first use since browsers require a user gesture.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private muted = !Persistence.isSoundOn();
  private chargeOsc: OscillatorNode | null = null;
  private chargeGain: GainNode | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  isMuted(): boolean {
    return this.muted;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    Persistence.setSoundOn(!this.muted);
    if (this.muted) this.stopCharge();
    return this.muted;
  }

  private tone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.25,
    delay = 0
  ): void {
    if (this.muted) return;
    const ctx = this.getCtx();
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + duration);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + Math.min(0.03, duration / 4));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  private noiseBurst(duration: number, gainPeak = 0.2, delay = 0): void {
    if (this.muted) return;
    const ctx = this.getCtx();
    const t0 = ctx.currentTime + delay;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainPeak, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(t0);
  }

  startCharge(): void {
    if (this.muted) return;
    this.stopCharge();
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    this.chargeOsc = osc;
    this.chargeGain = gain;
  }

  updateCharge(pct: number): void {
    if (!this.chargeOsc || this.muted) return;
    const freq = 140 + (pct / 100) * 260;
    this.chargeOsc.frequency.setTargetAtTime(freq, this.getCtx().currentTime, 0.05);
  }

  stopCharge(): void {
    if (this.chargeOsc) {
      const ctx = this.getCtx();
      this.chargeGain?.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      this.chargeOsc.stop(ctx.currentTime + 0.1);
      this.chargeOsc = null;
      this.chargeGain = null;
    }
  }

  playLaunch(perfect: boolean): void {
    this.tone(180, 720, 0.35, 'sawtooth', 0.28);
    this.noiseBurst(0.25, 0.15, 0.02);
    if (perfect) this.tone(700, 1400, 0.4, 'sine', 0.2, 0.05);
  }

  playBounce(intensity: number): void {
    const g = 0.1 + intensity * 0.25;
    this.tone(220 + intensity * 120, 90, 0.18, 'sine', g);
  }

  playBoost(): void {
    this.tone(320, 640, 0.2, 'square', 0.2);
  }

  playCollision(): void {
    this.tone(440, 880, 0.15, 'square', 0.2);
    this.noiseBurst(0.12, 0.12);
  }

  playMilestone(): void {
    this.tone(523, 523, 0.12, 'sine', 0.22);
    this.tone(659, 659, 0.14, 'sine', 0.22, 0.12);
    this.tone(784, 784, 0.22, 'sine', 0.22, 0.24);
  }

  playLanding(): void {
    this.tone(160, 60, 0.3, 'sine', 0.25);
    this.noiseBurst(0.2, 0.15);
  }

  playNewHighScore(): void {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, f, 0.18, 'sine', 0.24, i * 0.12));
  }
}

// Shared across every scene so mute state and the charge oscillator persist through scene changes.
export const audioManager = new AudioManager();

