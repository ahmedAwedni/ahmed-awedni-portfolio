/* ============================================================================
   MEDIEVAL AUDIO ENGINE — file-first SFX (ElevenLabs) with WebAudio foley fallback
   Drop ElevenLabs mp3s into public/assets/audio/ and list them in
   public/assets/audio/manifest.json → { "sfx": ["book-thud", "page-flip", ...] }
   ============================================================================ */

import { ELEVENLABS_AUDIO } from './i18n-data.js';

const SFX_FILES = ['chest-crescendo', 'star-burst', 'book-thud', 'page-flip', 'page-turn', 'bookmark-click', 'book-open'];

class GameAudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sfxEnabled = localStorage.getItem('aa_sfx') !== 'false';
    this.musicEnabled = localStorage.getItem('aa_music') === 'true';
    this.samples = {};
    this.lastHover = 0;

    this.shockwaveAudio = new Audio();
    this.shockwaveAudio.preload = 'none';
    this.shockwaveAudio.src = ELEVENLABS_AUDIO.localShockwaveUrl;

    this.bgmAudio = new Audio();
    this.bgmAudio.preload = 'none';
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = 0.26;
    this.bgmAudio.src = ELEVENLABS_AUDIO.localBgmUrl;

    this.loadManifest();
  }

  loadManifest() {
    fetch('public/assets/audio/manifest.json')
      .then((r) => (r.ok ? r.json() : { sfx: [] }))
      .then((data) => {
        (data.sfx || []).filter((n) => SFX_FILES.includes(n)).forEach((name) => {
          const a = new Audio(`public/assets/audio/${name}.mp3`);
          a.preload = 'auto';
          this.samples[name] = a;
        });
      })
      .catch(() => {});
  }

  /* ---------------------------------------------------------------- core */
  ensureContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  playSample(name, volume = 0.7) {
    const s = this.samples[name];
    if (!s) return false;
    try {
      const node = s.cloneNode();
      node.volume = volume;
      node.play().catch(() => {});
      return true;
    } catch (_) {
      return false;
    }
  }

  noise(duration, { type = 'bandpass', freq = 1200, q = 1, gain = 0.05, attack = 0.15, sweepTo = null, delay = 0 } = {}) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t0);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t0 + duration);
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + duration * attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t0); src.stop(t0 + duration + 0.02);
  }

  tone(freq, duration, { type = 'sine', gain = 0.05, attack = 0.01, slideTo = null, delay = 0, lowpass = null } = {}) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    let last = o;
    if (lowpass) {
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = lowpass;
      o.connect(f); last = f;
    }
    last.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0 + duration + 0.05);
  }

  harp(freq, duration = 0.6, gain = 0.045, delay = 0) {
    this.tone(freq, duration, { type: 'triangle', gain, delay, lowpass: freq * 3.2 });
    this.tone(freq * 2, duration * 0.7, { type: 'sine', gain: gain * 0.35, delay });
  }

  bell(freq, duration = 1.4, gain = 0.035, delay = 0) {
    [1, 2.76, 5.4].forEach((p, i) => this.tone(freq * p, duration / (i + 1), { gain: gain / (i + 1.2), delay }));
  }

  can() {
    if (!this.sfxEnabled) return false;
    this.ensureContext();
    return Boolean(this.ctx);
  }

  /* ---------------------------------------------------------------- toggles */
  setSfxEnabled(on) {
    this.sfxEnabled = Boolean(on);
    localStorage.setItem('aa_sfx', String(this.sfxEnabled));
    if (this.sfxEnabled) this.playClick();
  }

  setMusicEnabled(on) {
    this.musicEnabled = Boolean(on);
    localStorage.setItem('aa_music', String(this.musicEnabled));
    if (this.musicEnabled) {
      this.ensureContext();
      this.bgmAudio.play().catch(() => {});
    } else {
      this.bgmAudio.pause();
    }
  }

  /* ---------------------------------------------------------------- UI foley */
  playHoverTick() {
    const now = performance.now();
    if (now - this.lastHover < 70 || !this.can()) return;
    this.lastHover = now;
    this.noise(0.05, { freq: 1900, q: 2.2, gain: 0.018 });
  }

  playClick() {
    if (!this.can()) return;
    this.noise(0.08, { freq: 1300, q: 1.3, gain: 0.04 });
    this.harp(293.66, 0.34, 0.04);
    this.harp(440, 0.4, 0.032, 0.045);
  }

  playTabSwitch() { this.playClick(); }

  playCardFlip() {
    if (!this.can()) return;
    this.noise(0.15, { freq: 900, q: 1.1, gain: 0.06, sweepTo: 2200 });
    this.tone(196, 0.22, { type: 'triangle', gain: 0.05, lowpass: 700 });
  }

  playBookmark() {
    if (this.sfxEnabled && this.playSample('bookmark-click', 0.7)) return;
    if (!this.can()) return;
    this.noise(0.14, { type: 'highpass', freq: 4200, q: 0.7, gain: 0.035, sweepTo: 1800, attack: 0.3 });
    this.tone(620, 0.06, { type: 'triangle', gain: 0.05, slideTo: 300, delay: 0.09 });
  }

  playPageTurn(delay = 0) {
    if (this.sfxEnabled && delay === 0 && this.playSample('page-turn', 0.75)) return;
    if (!this.can()) return;
    this.noise(0.38, { freq: 700, q: 0.9, gain: 0.07, sweepTo: 2600, attack: 0.45, delay });
    this.noise(0.12, { type: 'highpass', freq: 3000, q: 0.6, gain: 0.025, delay: delay + 0.26 });
  }

  playPageFlip(count = 5) {
    if (this.sfxEnabled && this.playSample('page-flip', 0.8)) return;
    for (let i = 0; i < count; i++) this.playPageTurn(i * 0.075 + 0.0001);
  }

  playBookThud() {
    if (this.sfxEnabled && this.playSample('book-thud', 0.9)) return;
    if (!this.can()) return;
    this.tone(118, 0.42, { gain: 0.22, slideTo: 38 });
    this.tone(70, 0.5, { type: 'triangle', gain: 0.1, slideTo: 32, lowpass: 240 });
    this.noise(0.28, { type: 'lowpass', freq: 520, q: 0.8, gain: 0.16, attack: 0.04 });
    this.noise(0.5, { type: 'bandpass', freq: 2400, q: 0.5, gain: 0.025, attack: 0.2, delay: 0.05 });
  }

  playBookOpen() {
    if (this.sfxEnabled && this.playSample('book-open', 0.7)) return;
    if (!this.can()) return;
    this.tone(82, 0.55, { type: 'sawtooth', gain: 0.025, slideTo: 132, lowpass: 420 });
    this.noise(0.6, { freq: 600, q: 0.8, gain: 0.05, sweepTo: 2200, attack: 0.5, delay: 0.1 });
  }

  playChestCrescendo() {
    if (this.sfxEnabled && this.playSample('chest-crescendo', 0.85)) return;
    if (!this.can()) return;
    // Accelerating wooden rattles
    let t = 0;
    for (let i = 0; i < 12; i++) {
      this.noise(0.05, { freq: 320 + i * 22, q: 2.4, gain: 0.05 + i * 0.006, attack: 0.1, delay: t });
      t += Math.max(0.035, 0.12 - i * 0.008);
    }
    // Rising arcane shimmer
    [293.66, 369.99, 440].forEach((f, i) => {
      this.tone(f, 1.05, { gain: 0.022, slideTo: f * 2.2, attack: 0.6, delay: i * 0.02 });
    });
  }

  playStarBurst() {
    if (this.sfxEnabled && this.playSample('star-burst', 0.85)) return;
    if (!this.can()) return;
    this.noise(0.7, { type: 'highpass', freq: 1200, q: 0.5, gain: 0.07, sweepTo: 6000, attack: 0.08 });
    this.bell(1174.66, 1.6, 0.05);
    [587.33, 739.99, 880, 1174.66, 1479.98].forEach((f, i) => this.harp(f, 1.1, 0.05, 0.05 + i * 0.06));
    this.tone(73.4, 0.9, { gain: 0.16, slideTo: 41 });
  }

  playAchievementChime() {
    if (!this.can()) return;
    [293.66, 369.99, 440, 587.33].forEach((f, i) => this.harp(f, 0.8, 0.05, i * 0.065));
  }

  playShockwavePulse() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    try {
      this.shockwaveAudio.currentTime = 0;
      this.shockwaveAudio.volume = 0.55;
      this.shockwaveAudio.play().catch(() => {});
    } catch (_) { /* ignore */ }
    if (!this.ctx) return;
    this.noise(0.5, { freq: 800, q: 0.9, gain: 0.05 });
    [293.66, 440, 587.33, 880].forEach((f, i) => this.harp(f, 0.95, 0.045, i * 0.05));
  }
}

export const audioEngine = new GameAudioEngine();
