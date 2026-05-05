// 8bit 효과음 합성기 (Web Audio API)
// 에셋 파일 없이 OscillatorNode로 사인/스퀘어/소우 합성
// 첫 user gesture 이후 AudioContext 활성화 (브라우저 정책)

type SoundName =
  | 'click'
  | 'tick'
  | 'buy'
  | 'sell'
  | 'countdown'
  | 'win'
  | 'loss'
  | 'reveal';

const STORAGE_KEY = 'pixel-stonks-muted';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;

  constructor() {
    try {
      this.muted = localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      /* ignore */
    }
  }

  private ensure(): { ctx: AudioContext; master: GainNode } | null {
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return { ctx: this.ctx, master: this.master! };
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    try {
      localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    } catch {
      /* ignore */
    }
  }

  isMuted() {
    return this.muted;
  }

  play(name: SoundName) {
    if (this.muted) return;
    const eng = this.ensure();
    if (!eng) return;
    const { ctx, master } = eng;

    switch (name) {
      case 'click':
        beep(ctx, master, 660, 0.05, 0.04, 'square');
        break;
      case 'tick':
        beep(ctx, master, 1200, 0.025, 0.012, 'square');
        break;
      case 'buy':
        arp(ctx, master, [523.25, 659.25, 783.99], 0.06, 'square');
        break;
      case 'sell':
        arp(ctx, master, [783.99, 659.25, 523.25], 0.06, 'square');
        break;
      case 'countdown':
        beep(ctx, master, 440, 0.18, 0.12, 'square');
        break;
      case 'win':
        arp(ctx, master, [523.25, 659.25, 783.99, 1046.5], 0.08, 'square');
        break;
      case 'loss':
        arp(ctx, master, [392.0, 311.13, 261.63, 207.65], 0.13, 'sawtooth');
        break;
      case 'reveal':
        beep(ctx, master, 880, 0.12, 0.08, 'triangle');
        break;
    }
  }
}

function beep(
  ctx: AudioContext,
  out: AudioNode,
  freq: number,
  dur: number,
  vol: number,
  type: OscillatorType,
) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function arp(
  ctx: AudioContext,
  out: AudioNode,
  freqs: number[],
  step: number,
  type: OscillatorType,
) {
  freqs.forEach((freq, i) => {
    const t = ctx.currentTime + i * step;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.08, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + step);
    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + step + 0.02);
  });
}

export const sound = new SoundEngine();

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}
