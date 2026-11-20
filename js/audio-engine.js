/* ============================================================================
   MEDIEVAL AUDIO ENGINE — 2-track BGM state machine, tab-switch auto-mute,
   file-first SFX (ElevenLabs) with WebAudio foley & legendary 5★ reveal SFX.
   Drop ElevenLabs mp3s into public/assets/audio/ and list them in
   public/assets/audio/manifest.json → { "sfx": [...], "bgmAct1": "bgm-act1" }
   ============================================================================ */

import { ELEVENLABS_AUDIO } from './i18n-data.js';

const SFX_FILES = [
  'chest-crescendo',
  'star-burst',
  'legendary-reveal',
  'book-thud',
  'page-flip',
  'page-turn',
  'bookmark-click',
  'book-open'
];

const BGM_TRACK2_TARGET = 0.26;
const DORIAN_CHIMES = [440, 587.33, 659.25, 698.46, 880];

class GameAudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sfxEnabled = localStorage.getItem('aa_sfx') !== 'false';
    this.musicEnabled = localStorage.getItem('aa_music_v2') !== 'false';
    this.tabMuted = false;
    this.bgmScene = 'act1'; // 'act1' | 'opening' | 'act2'
    this.samples = {};
    this.activeSampleNodes = new Set();
    this.lastHover = 0;

    this.track1Nodes = null;
    this.act1BgmGain = null;
    this.track1ChimeTimer = null;
    this.track1StopTimer = null;
    this.suspendTimer = null;
    this.track2FadeRaf = 0;
    this.track1AudioFadeRaf = 0;
    this.chimeIndex = 0;

    this.shockwaveAudio = new Audio();
    this.shockwaveAudio.preload = 'none';
    this.shockwaveAudio.src = ELEVENLABS_AUDIO.localShockwaveUrl;

    this.bgmAudio = new Audio();
    this.bgmAudio.preload = 'none';
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = BGM_TRACK2_TARGET;
    this.bgmAudio.src = ELEVENLABS_AUDIO.localBgmUrl;

    this.bgmAct1Audio = null;

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
        if (data.bgmAct1) {
          this.bgmAct1Audio = new Audio(`public/assets/audio/${data.bgmAct1}.mp3`);
          this.bgmAct1Audio.preload = 'auto';
          this.bgmAct1Audio.loop = true;
          this.bgmAct1Audio.volume = 0.22;
          if (this.musicEnabled && !this.tabMuted && this.bgmScene === 'act1') {
            this._syncBgm(true);
          }
        }
      })
      .catch(() => {});
  }

  /* ---------------------------------------------------------------- core */
  ensureContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.tabMuted ? 0.0001 : 0.9;
      this.master.connect(this.ctx.destination);
    }
    if (!this.tabMuted && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playSample(name, volume = 0.7) {
    if (!this.sfxEnabled || this.tabMuted) return false;
    const s = this.samples[name];
    if (!s) return false;
    try {
      const node = s.cloneNode();
      node.volume = volume;
      this.activeSampleNodes.add(node);
      const cleanup = () => this.activeSampleNodes.delete(node);
      node.addEventListener('ended', cleanup, { once: true });
      node.play().catch(cleanup);
      return true;
    } catch (_) {
      return false;
    }
  }

  noise(duration, { type = 'bandpass', freq = 1200, q = 1, gain = 0.05, attack = 0.15, sweepTo = null, delay = 0, dest = null } = {}) {
    if (!this.ctx) return;
    const target = dest || this.master;
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
    src.connect(f); f.connect(g); g.connect(target);
    src.start(t0); src.stop(t0 + duration + 0.02);
  }

  tone(freq, duration, { type = 'sine', gain = 0.05, attack = 0.01, slideTo = null, delay = 0, lowpass = null, dest = null } = {}) {
    if (!this.ctx) return;
    const target = dest || this.master;
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
    last.connect(g); g.connect(target);
    o.start(t0); o.stop(t0 + duration + 0.05);
  }

  harp(freq, duration = 0.6, gain = 0.045, delay = 0, dest = null) {
    this.tone(freq, duration, { type: 'triangle', gain, delay, lowpass: freq * 3.2, dest });
    this.tone(freq * 2, duration * 0.7, { type: 'sine', gain: gain * 0.35, delay, dest });
  }

  bell(freq, duration = 1.4, gain = 0.035, delay = 0, dest = null) {
    [1, 2.76, 5.4].forEach((p, i) => this.tone(freq * p, duration / (i + 1), { gain: gain / (i + 1.2), delay, dest }));
  }

  can() {
    if (!this.sfxEnabled || this.tabMuted) return false;
    this.ensureContext();
    return Boolean(this.ctx);
  }

  /* ---------------------------------------------------------------- autoplay & tab visibility */
  initAutoplayAndVisibility() {
    if (this.musicEnabled && !this.tabMuted) {
      this._syncBgm(true);
    }

    const onGesture = (e) => {
      if (this.tabMuted) return;
      const onChestTrigger = Boolean(e?.target?.closest?.('#chest, #open-chest-btn'));
      this.ensureContext();
      if (this.musicEnabled && !(onChestTrigger && this.bgmScene === 'act1')) {
        const tryPlay = () => {
          if (this.musicEnabled && !this.tabMuted && this.bgmScene !== 'opening') {
            this._syncBgm(true);
          }
        };
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().then(tryPlay).catch(() => {});
        } else {
          tryPlay();
        }
      }
    };

    ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => {
      window.addEventListener(ev, onGesture, { capture: true, passive: true });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.muteForBackground();
      else this.resumeFromBackground();
    });
    window.addEventListener('blur', () => this.muteForBackground());
    window.addEventListener('focus', () => {
      if (!document.hidden) this.resumeFromBackground();
    });
    window.addEventListener('pagehide', () => this.muteForBackground());
  }

  muteForBackground() {
    if (this.tabMuted) return;
    this.tabMuted = true;
    clearTimeout(this.suspendTimer);
    cancelAnimationFrame(this.track2FadeRaf);
    cancelAnimationFrame(this.track1AudioFadeRaf);

    this.bgmAudio.pause();
    if (this.bgmAct1Audio) this.bgmAct1Audio.pause();
    try { this.shockwaveAudio.pause(); } catch (_) { /* ignore */ }
    this.activeSampleNodes.forEach((n) => {
      try { n.pause(); } catch (_) { /* ignore */ }
    });
    this._stopTrack1Chimes();

    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
      this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      this.suspendTimer = setTimeout(() => {
        if (this.tabMuted && this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      }, 140);
    }
  }

  resumeFromBackground() {
    if (!this.tabMuted) return;
    this.tabMuted = false;
    clearTimeout(this.suspendTimer);

    if (this.ctx && this.master) {
      const restore = () => {
        if (this.tabMuted || !this.ctx || !this.master) return;
        const now = this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
        this.master.gain.linearRampToValueAtTime(0.9, now + 0.45);
        if (this.musicEnabled && this.bgmScene !== 'opening') {
          this._syncBgm(true, 0.65);
        }
      };
      if (this.ctx.state === 'suspended') this.ctx.resume().then(restore).catch(() => {});
      else restore();
    } else if (this.musicEnabled && this.bgmScene !== 'opening') {
      this._syncBgm(true, 0.65);
    }
  }

  /* ---------------------------------------------------------------- 2-track BGM engine */
  _tweenAudioVolume(audio, fromVol, toVol, durationSec, rafKey, onDone = null) {
    cancelAnimationFrame(this[rafKey]);
    if (fromVol != null) audio.volume = fromVol;
    const startVol = audio.volume;
    const t0 = performance.now();
    const durMs = Math.max(16, durationSec * 1000);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / durMs);
      const eased = 1 - Math.pow(1 - p, 2);
      audio.volume = Math.max(0, Math.min(1, startVol + (toVol - startVol) * eased));
      if (p < 1) this[rafKey] = requestAnimationFrame(step);
      else onDone?.();
    };
    this[rafKey] = requestAnimationFrame(step);
  }

  _startTrack1Chimes() {
    this._stopTrack1Chimes();
    const triggerChime = () => {
      if (!this.musicEnabled || this.tabMuted || this.bgmScene !== 'act1' || !this.ctx || this.ctx.state !== 'running' || !this.act1BgmGain) return;
      const f = DORIAN_CHIMES[this.chimeIndex % DORIAN_CHIMES.length];
      this.chimeIndex++;
      this.harp(f, 2.2, 0.016, 0, this.act1BgmGain);
      this.tone(f * 2, 1.5, { type: 'sine', gain: 0.006, attack: 0.03, delay: 0.14, dest: this.act1BgmGain });
    };
    this.track1ChimeTimer = setInterval(triggerChime, 3200);
    setTimeout(triggerChime, 450);
  }

  _stopTrack1Chimes() {
    if (this.track1ChimeTimer) {
      clearInterval(this.track1ChimeTimer);
      this.track1ChimeTimer = null;
    }
  }

  _ensureTrack1Nodes() {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return null;
    if (this.track1Nodes) return this.track1Nodes;

    clearTimeout(this.track1StopTimer);
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    gainNode.connect(this.master);
    this.act1BgmGain = gainNode;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 230;
    filter.Q.value = 1.2;
    filter.connect(gainNode);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.09;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 80;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const oscSpecs = [
      { f: 73.42, type: 'sine', g: 0.16, toFilter: false },
      { f: 110.0, type: 'triangle', g: 0.08, toFilter: true },
      { f: 146.83, type: 'sawtooth', g: 0.04, toFilter: true },
      { f: 147.25, type: 'sawtooth', g: 0.04, toFilter: true }
    ];
    const oscs = [];
    const subGains = [];
    oscSpecs.forEach((sp) => {
      const o = ctx.createOscillator();
      o.type = sp.type;
      o.frequency.value = sp.f;
      const og = ctx.createGain();
      og.gain.value = sp.g;
      o.connect(og);
      og.connect(sp.toFilter ? filter : gainNode);
      o.start();
      oscs.push(o);
      subGains.push(og);
    });

    // Looped 4s pink-filtered void mist buffer
    const bufLen = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let b0 = 0; let b1 = 0; let b2 = 0;
    for (let i = 0; i < bufLen; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + w * 0.029;
      b1 = 0.985 * b1 + w * 0.032;
      b2 = 0.950 * b2 + w * 0.048;
      data[i] = (b0 + b1 + b2) * 0.28;
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buf;
    noiseSrc.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 320;
    band.Q.value = 1.8;
    const nGain = ctx.createGain();
    nGain.gain.value = 0.014;
    noiseSrc.connect(band);
    band.connect(nGain);
    nGain.connect(gainNode);
    noiseSrc.start();

    this.track1Nodes = { gainNode, filter, lfo, lfoGain, oscs, subGains, noiseSrc, band, nGain };
    return this.track1Nodes;
  }

  _stopTrack1(fadeSec = 0.25) {
    this._stopTrack1Chimes();
    clearTimeout(this.track1StopTimer);
    cancelAnimationFrame(this.track1AudioFadeRaf);

    if (this.bgmAct1Audio && !this.bgmAct1Audio.paused) {
      this._tweenAudioVolume(this.bgmAct1Audio, null, 0, fadeSec, 'track1AudioFadeRaf', () => {
        this.bgmAct1Audio.pause();
      });
    }

    if (!this.track1Nodes || !this.ctx) return;
    const nodes = this.track1Nodes;
    const now = this.ctx.currentTime;
    nodes.gainNode.gain.cancelScheduledValues(now);
    nodes.gainNode.gain.setValueAtTime(Math.max(0.0001, nodes.gainNode.gain.value), now);
    nodes.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + fadeSec);
    this.track1Nodes = null;
    this.act1BgmGain = null;

    this.track1StopTimer = setTimeout(() => {
      try {
        nodes.oscs.forEach((o) => o.stop());
        nodes.lfo.stop();
        nodes.noiseSrc.stop();
        nodes.gainNode.disconnect();
      } catch (_) { /* ignore */ }
    }, Math.ceil((fadeSec + 0.04) * 1000));
  }

  _startTrack1(fadeSec = 0.9) {
    if (!this.musicEnabled || this.tabMuted || this.bgmScene !== 'act1') return;
    if (this.bgmAct1Audio) {
      this.bgmAct1Audio.volume = 0.01;
      const p = this.bgmAct1Audio.play();
      if (p) p.then(() => this._tweenAudioVolume(this.bgmAct1Audio, 0.01, 0.22, fadeSec, 'track1AudioFadeRaf')).catch(() => {});
      return;
    }
    const nodes = this._ensureTrack1Nodes();
    if (!nodes || !this.ctx) return;
    const now = this.ctx.currentTime;
    nodes.gainNode.gain.cancelScheduledValues(now);
    nodes.gainNode.gain.setValueAtTime(Math.max(0.0001, nodes.gainNode.gain.value), now);
    nodes.gainNode.gain.linearRampToValueAtTime(0.55, now + fadeSec);
    this._startTrack1Chimes();
  }

  _startTrack2(fadeSec = 1.4) {
    if (!this.musicEnabled || this.tabMuted || this.bgmScene !== 'act2') return;
    cancelAnimationFrame(this.track2FadeRaf);
    this.bgmAudio.volume = 0.01;
    const p = this.bgmAudio.play();
    if (p) {
      p.then(() => {
        if (this.musicEnabled && !this.tabMuted && this.bgmScene === 'act2') {
          this._tweenAudioVolume(this.bgmAudio, 0.01, BGM_TRACK2_TARGET, fadeSec, 'track2FadeRaf');
        }
      }).catch(() => {});
    }
  }

  _stopTrack2(fadeSec = 0.45) {
    cancelAnimationFrame(this.track2FadeRaf);
    if (this.bgmAudio.paused) return;
    if (fadeSec <= 0.05) {
      this.bgmAudio.pause();
      return;
    }
    this._tweenAudioVolume(this.bgmAudio, null, 0, fadeSec, 'track2FadeRaf', () => {
      this.bgmAudio.pause();
    });
  }

  _syncBgm(fadeIn = true, overrideFade = null) {
    if (!this.musicEnabled || this.tabMuted || this.bgmScene === 'opening') {
      this._stopTrack1(0.2);
      this._stopTrack2(0.25);
      return;
    }
    if (this.bgmScene === 'act1') {
      this._stopTrack2(0.45);
      this._startTrack1(overrideFade ?? (fadeIn ? 0.9 : 0.35));
    } else if (this.bgmScene === 'act2') {
      this._stopTrack1(0.2);
      this._startTrack2(overrideFade ?? (fadeIn ? 1.4 : 0.6));
    }
  }

  setBgmScene(scene) {
    if (this.bgmScene === scene) {
      if (this.musicEnabled && !this.tabMuted) this._syncBgm(true);
      return;
    }
    this.bgmScene = scene;
    this._syncBgm(true);
  }

  duckAct1Bgm() {
    this.bgmScene = 'opening';
    this._stopTrack1(0.2);
    this._stopTrack2(0.1);
  }

  /* ---------------------------------------------------------------- toggles */
  setSfxEnabled(on) {
    this.sfxEnabled = Boolean(on);
    localStorage.setItem('aa_sfx', String(this.sfxEnabled));
    if (this.sfxEnabled) this.playClick();
  }

  setMusicEnabled(on) {
    this.musicEnabled = Boolean(on);
    localStorage.setItem('aa_music_v2', String(this.musicEnabled));
    if (this.musicEnabled) {
      this.ensureContext();
      this._syncBgm(true, 0.7);
    } else {
      this._stopTrack1(0.25);
      this._stopTrack2(0.35);
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
    if (this.playSample('bookmark-click', 0.7)) return;
    if (!this.can()) return;
    this.noise(0.14, { type: 'highpass', freq: 4200, q: 0.7, gain: 0.035, sweepTo: 1800, attack: 0.3 });
    this.tone(620, 0.06, { type: 'triangle', gain: 0.05, slideTo: 300, delay: 0.09 });
  }

  playPageTurn(delay = 0) {
    if (delay === 0 && this.playSample('page-turn', 0.75)) return;
    if (!this.can()) return;
    this.noise(0.38, { freq: 700, q: 0.9, gain: 0.07, sweepTo: 2600, attack: 0.45, delay });
    this.noise(0.12, { type: 'highpass', freq: 3000, q: 0.6, gain: 0.025, delay: delay + 0.26 });
  }

  playPageFlip(count = 5) {
    if (this.playSample('page-flip', 0.8)) return;
    for (let i = 0; i < count; i++) this.playPageTurn(i * 0.075 + 0.0001);
  }

  playBookThud() {
    if (this.playSample('book-thud', 0.9)) return;
    if (!this.can()) return;
    this.tone(118, 0.42, { gain: 0.22, slideTo: 38 });
    this.tone(70, 0.5, { type: 'triangle', gain: 0.1, slideTo: 32, lowpass: 240 });
    this.noise(0.28, { type: 'lowpass', freq: 520, q: 0.8, gain: 0.16, attack: 0.04 });
    this.noise(0.5, { type: 'bandpass', freq: 2400, q: 0.5, gain: 0.025, attack: 0.2, delay: 0.05 });
  }

  playBookOpen() {
    if (this.playSample('book-open', 0.7)) return;
    if (!this.can()) return;
    this.tone(82, 0.55, { type: 'sawtooth', gain: 0.025, slideTo: 132, lowpass: 420 });
    this.noise(0.6, { freq: 600, q: 0.8, gain: 0.05, sweepTo: 2200, attack: 0.5, delay: 0.1 });
  }

  playChestCrescendo() {
    if (this.playSample('chest-crescendo', 0.85)) return;
    if (!this.can()) return;
    let t = 0;
    for (let i = 0; i < 12; i++) {
      this.noise(0.05, { freq: 320 + i * 22, q: 2.4, gain: 0.05 + i * 0.006, attack: 0.1, delay: t });
      t += Math.max(0.035, 0.12 - i * 0.008);
    }
    [293.66, 369.99, 440].forEach((f, i) => {
      this.tone(f, 1.05, { gain: 0.022, slideTo: f * 2.2, attack: 0.6, delay: i * 0.02 });
    });
  }

  playStarBurst() {
    if (this.playSample('star-burst', 0.85)) return;
    if (!this.can()) return;
    this.noise(0.7, { type: 'highpass', freq: 1200, q: 0.5, gain: 0.07, sweepTo: 6000, attack: 0.08 });
    this.bell(1174.66, 1.6, 0.05);
    [587.33, 739.99, 880, 1174.66, 1479.98].forEach((f, i) => this.harp(f, 1.1, 0.05, 0.05 + i * 0.06));
    this.tone(73.4, 0.9, { gain: 0.16, slideTo: 41 });
  }

  /* Dedicated 5★ Character Reveal SFX (decoupled from FR<->EN language shockwave) */
  playLegendaryReveal() {
    if (!this.sfxEnabled || this.tabMuted) return;
    if (this.playSample('legendary-reveal', 0.9)) return;
    if (!this.can()) return;
    const t0 = this.ctx.currentTime;

    // 1. Crystalline burst shimmer + ascending D-Lydian celesta cascade
    this.noise(0.55, { type: 'highpass', freq: 2200, q: 0.6, gain: 0.065, sweepTo: 8400, attack: 0.08 });
    [1174.66, 1479.98, 1760, 2217.46, 2349.32, 2959.96].forEach((f, i) => {
      const delay = i * 0.038;
      this.tone(f, 0.9, { type: 'sine', gain: 0.042, attack: 0.008, delay });
      this.tone(f * 2, 0.55, { type: 'sine', gain: 0.016, attack: 0.006, delay });
    });

    // 2. Resonant D2 sub-bass impact
    this.tone(73.42, 0.95, { type: 'sine', gain: 0.20, attack: 0.015, slideTo: 36.71, delay: 0.02 });

    // 3. Triumphant Dmaj9 brass/choir chord swell through swept lowpass filter
    const swellFilter = this.ctx.createBiquadFilter();
    swellFilter.type = 'lowpass';
    swellFilter.Q.value = 0.85;
    swellFilter.frequency.setValueAtTime(320, t0 + 0.02);
    swellFilter.frequency.exponentialRampToValueAtTime(2400, t0 + 0.36);
    swellFilter.frequency.exponentialRampToValueAtTime(780, t0 + 1.85);
    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(0.0001, t0 + 0.02);
    swellGain.gain.linearRampToValueAtTime(0.032, t0 + 0.24);
    swellGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.88);
    swellFilter.connect(swellGain);
    swellGain.connect(this.master);

    [146.83, 220, 293.66, 369.99, 440, 659.25].forEach((freq) => {
      [-0.004, 0.004].forEach((det) => {
        const o = this.ctx.createOscillator();
        o.type = det < 0 ? 'sawtooth' : 'triangle';
        o.frequency.setValueAtTime(freq * (1 + det), t0 + 0.02);
        o.connect(swellFilter);
        o.start(t0 + 0.02);
        o.stop(t0 + 1.92);
      });
    });

    // 4. Radiant cathedral chime tail
    this.bell(587.33, 1.9, 0.045, 0.14);
    this.bell(880, 1.7, 0.038, 0.22);
  }

  playAchievementChime() {
    if (!this.can()) return;
    [293.66, 369.99, 440, 587.33].forEach((f, i) => this.harp(f, 0.8, 0.05, i * 0.065));
  }

  playShockwavePulse() {
    if (!this.sfxEnabled || this.tabMuted) return;
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
