/* ============================================================================
   ELEVENLABS MCP + ZERO-LATENCY WEBAUDIO SYNTHESIZER ENGINE
   Handles tactile UI hover ticks, tab switches, card flips, Shockwave SFX & BGM
   ============================================================================ */

import { ELEVENLABS_AUDIO } from './i18n-data.js';

class GameAudioEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = localStorage.getItem('ahmed_hud_sfx') !== 'false';
    this.musicEnabled = localStorage.getItem('ahmed_hud_music') === 'true';

    this.shockwaveAudio = new Audio();
    this.shockwaveAudio.crossOrigin = 'anonymous';
    this.shockwaveAudio.preload = 'auto';
    this.shockwaveAudio.src = ELEVENLABS_AUDIO.shockwaveUrl;
    this.shockwaveAudio.addEventListener('error', () => {
      if (this.shockwaveAudio.src !== location.origin + ELEVENLABS_AUDIO.localShockwaveUrl) {
        this.shockwaveAudio.src = ELEVENLABS_AUDIO.localShockwaveUrl;
      }
    });

    this.bgmAudio = new Audio();
    this.bgmAudio.crossOrigin = 'anonymous';
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = 0.28;
    this.bgmAudio.src = ELEVENLABS_AUDIO.bgmUrl;
    this.bgmAudio.addEventListener('error', () => {
      if (this.bgmAudio.src !== location.origin + ELEVENLABS_AUDIO.localBgmUrl) {
        this.bgmAudio.src = ELEVENLABS_AUDIO.localBgmUrl;
      }
    });

    this.ambientOscNodes = [];
    this.ambientInterval = null;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setSfxEnabled(state) {
    this.sfxEnabled = Boolean(state);
    localStorage.setItem('ahmed_hud_sfx', String(this.sfxEnabled));
    if (this.sfxEnabled) {
      this.playTabSwitch();
    }
  }

  setMusicEnabled(state) {
    this.musicEnabled = Boolean(state);
    localStorage.setItem('ahmed_hud_music', String(this.musicEnabled));
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  startMusic() {
    this.ensureContext();
    this.bgmAudio.play().catch(() => {
      // Fallback to procedural dark-fantasy lute/drone synth if external stream blocked
      this.startProceduralAmbient();
    });
  }

  stopMusic() {
    this.bgmAudio.pause();
    this.stopProceduralAmbient();
  }

  startProceduralAmbient() {
    this.stopProceduralAmbient();
    if (!this.ctx || !this.musicEnabled) return;

    // Gentle D-dorian medieval harp arpeggio every 2.2s
    const notes = [146.83, 174.61, 220.0, 261.63, 293.66, 329.63, 220.0, 174.61];
    let idx = 0;
    const playPluck = () => {
      if (!this.musicEnabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[idx % notes.length], now);
      idx++;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.9);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.95);
    };
    playPluck();
    this.ambientInterval = setInterval(playPluck, 1800);
  }

  stopProceduralAmbient() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }

  /* Tactile UI Hover Tick */
  playHoverTick() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(980, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.028);

    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.032);
  }

  /* Tab / Filter / Hero Switch */
  playTabSwitch() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);

    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  }

  /* Card Flip / Combat Action Click */
  playCardFlip() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.065);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  /* +100 XP / Achievement Chime */
  playAchievementChime() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.5];
    chords.forEach((freq, i) => {
      const now = this.ctx.currentTime + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);
    });
  }

  /* ElevenLabs Shockwave Pulse + Sub-Bass Arcane Resonance */
  playShockwavePulse() {
    if (!this.sfxEnabled) return;
    this.ensureContext();

    // Trigger ElevenLabs generated shockwave SFX
    try {
      this.shockwaveAudio.currentTime = 0;
      this.shockwaveAudio.volume = 0.55;
      this.shockwaveAudio.play().catch(() => {});
    } catch (_) {}

    // Layer zero-latency WebAudio arcane sub-drop + shimmer
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Sub-bass impact sweep
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(160, now);
    sub.frequency.exponentialRampToValueAtTime(38, now + 0.65);
    subGain.gain.setValueAtTime(0.16, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + 0.72);

    // 2. High arcane crystalline chord
    [587.33, 880, 1174.66].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, now + 0.55);
      gain.gain.setValueAtTime(0.045, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.03);
      osc.stop(now + 0.62);
    });
  }
}

export const audioEngine = new GameAudioEngine();
