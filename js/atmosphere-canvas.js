/* ============================================================================
   ATMOSPHERE ENGINE — scene particles (fireflies, golden dust, petals, sunbeam
   motes), dust puffs, spark bursts and the full-screen runic shockwave.
   ============================================================================ */

const PALETTES = {
  fireflies: ['#f6e27a', '#d9f27a', '#fff3b0'],
  meadow: ['#f6d77a', '#fff1c4', '#e8b84a'],
  default: ['#ffe9a8', '#f6d77a', '#fff6dc'],
  'wise-battle': ['#9be7a8', '#f6d77a', '#e6ffd8'],
  naruto: ['#ffb36b', '#ff7a4d', '#ffd8a8'],
  'magic-words': ['#c9a7ff', '#8fe3ff', '#f3e6ff'],
  balloon: ['#bfe6ff', '#ffffff', '#ffe08a'],
  'locked-slot': ['#7ff0c0', '#d6ffe9', '#f6d77a']
};

const PETALS = ['#f7c6d0', '#fff2e0', '#f3b6c2'];
const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛞ'];

export class AtmosphereEngine {
  constructor(particleCanvas, fxCanvas) {
    this.pc = particleCanvas;
    this.px = particleCanvas.getContext('2d');
    this.fc = fxCanvas;
    this.fx = fxCanvas.getContext('2d');
    this.mode = 'fireflies';
    this.tint = 'default';
    this.particles = [];
    this.petals = [];
    this.sparks = [];
    this.waves = [];
    this.dust = [];
    this.t = 0;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.seed();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    [this.pc, this.fc].forEach((c) => {
      c.width = Math.round(this.w * dpr);
      c.height = Math.round(this.h * dpr);
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    });
  }

  seed() {
    const count = this.reduced ? 14 : (this.w < 700 ? 26 : 46);
    this.particles = Array.from({ length: count }, () => this.makeParticle(true));
    this.petals = Array.from({ length: this.reduced ? 0 : 10 }, () => this.makePetal(true));
  }

  palette() {
    if (this.mode === 'fireflies') return PALETTES.fireflies;
    if (this.mode === 'meadow') return PALETTES.meadow;
    return PALETTES[this.tint] || PALETTES.default;
  }

  makeParticle(anywhere = false) {
    const pal = this.palette();
    return {
      x: Math.random() * this.w,
      y: anywhere ? Math.random() * this.h : this.h + 10,
      r: 1 + Math.random() * 2.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.1 - Math.random() * 0.35,
      a: 0.25 + Math.random() * 0.55,
      ph: Math.random() * Math.PI * 2,
      c: pal[Math.floor(Math.random() * pal.length)]
    };
  }

  makePetal(anywhere = false) {
    return {
      x: anywhere ? Math.random() * this.w : -20,
      y: Math.random() * this.h * 0.8,
      s: 3 + Math.random() * 3,
      vx: 0.6 + Math.random() * 0.8,
      vy: 0.15 + Math.random() * 0.3,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.04,
      ph: Math.random() * 6,
      c: PETALS[Math.floor(Math.random() * PETALS.length)]
    };
  }

  setMode(mode, tint = this.tint) {
    this.mode = mode;
    this.tint = tint;
    const pal = this.palette();
    this.particles.forEach((p) => { p.c = pal[Math.floor(Math.random() * pal.length)]; });
  }

  setTint(tint) { this.setMode(this.mode, tint); }

  /* ------------------------------------------------------------ effects */
  burst(x, y, { count = 60, colors = ['#fff3c4', '#f6d77a', '#d4af37'], speed = 12, runes = false } = {}) {
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const sp = speed * (0.3 + Math.random() * 0.9);
      this.sparks.push({
        x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        r: 1.5 + Math.random() * 3.5, a: 1,
        c: colors[i % colors.length],
        rune: runes && i % 4 === 0 ? RUNES[i % RUNES.length] : null
      });
    }
  }

  dustPuff(x, y, width = 400) {
    for (let i = 0; i < 70; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      this.dust.push({
        x: x + (Math.random() - 0.5) * width,
        y: y + (Math.random() - 0.5) * 20,
        vx: side * (1 + Math.random() * 4),
        vy: -0.4 - Math.random() * 1.8,
        r: 6 + Math.random() * 16,
        a: 0.35 + Math.random() * 0.25,
        grow: 0.25 + Math.random() * 0.35
      });
    }
  }

  shockwave(x, y, { color = [247, 201, 72], runes = true } = {}) {
    const max = Math.hypot(Math.max(x, this.w - x), Math.max(y, this.h - y)) * 1.15;
    this.waves.push({ x, y, p: 0, max, color, runes, rot: 0 });
    this.burst(x, y, { count: 64, speed: 14, runes, colors: ['#fff8e7', '#f7c948', '#7fd99a'] });
  }

  /* ------------------------------------------------------------ loop */
  loop() {
    this.t += 0.016;
    this.drawParticles();
    this.drawFx();
    requestAnimationFrame(this.loop);
  }

  drawParticles() {
    const c = this.px;
    c.clearRect(0, 0, this.w, this.h);
    const firefly = this.mode === 'fireflies';
    for (const p of this.particles) {
      p.ph += 0.02;
      if (firefly) {
        p.x += Math.cos(p.ph * 0.7) * 0.45 + p.vx;
        p.y += Math.sin(p.ph) * 0.35;
      } else {
        p.x += p.vx + Math.sin(p.ph) * 0.2;
        p.y += p.vy;
      }
      if (p.y < -12 || p.x < -20 || p.x > this.w + 20 || p.y > this.h + 20) Object.assign(p, this.makeParticle(firefly));
      const flick = firefly ? Math.max(0, Math.sin(p.ph * 1.6)) : 0.6 + 0.4 * Math.sin(p.ph);
      c.globalAlpha = p.a * flick;
      c.fillStyle = p.c;
      c.shadowColor = p.c;
      c.shadowBlur = firefly ? 14 : 6;
      c.beginPath();
      c.arc(p.x, p.y, firefly ? p.r * 1.2 : p.r, 0, Math.PI * 2);
      c.fill();
    }
    c.shadowBlur = 0;
    if (this.mode === 'meadow') {
      for (const f of this.petals) {
        f.ph += 0.03;
        f.x += f.vx + Math.sin(f.ph) * 0.4;
        f.y += f.vy + Math.cos(f.ph * 0.8) * 0.3;
        f.rot += f.vr;
        if (f.x > this.w + 30 || f.y > this.h + 30) Object.assign(f, this.makePetal(false));
        c.save();
        c.globalAlpha = 0.75;
        c.translate(f.x, f.y);
        c.rotate(f.rot);
        c.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(f.ph)));
        c.fillStyle = f.c;
        c.beginPath();
        c.ellipse(0, 0, f.s * 1.4, f.s * 0.8, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }
    c.globalAlpha = 1;
  }

  drawFx() {
    const c = this.fx;
    c.clearRect(0, 0, this.w, this.h);
    if (!this.waves.length && !this.sparks.length && !this.dust.length) return;

    for (let i = this.waves.length - 1; i >= 0; i--) {
      const wv = this.waves[i];
      wv.p += 0.0125;
      wv.rot += 0.02;
      const e = 1 - Math.pow(1 - Math.min(1, wv.p), 2.4);
      const r = 10 + e * wv.max;
      const a = Math.max(0, 1 - Math.pow(wv.p, 1.5));
      const [cr, cg, cb] = wv.color;
      if (wv.p < 0.3) {
        c.fillStyle = `rgba(255,246,210,${(1 - wv.p / 0.3) * 0.22})`;
        c.fillRect(0, 0, this.w, this.h);
      }
      c.save();
      c.shadowColor = `rgb(${cr},${cg},${cb})`;
      c.shadowBlur = 34;
      c.strokeStyle = `rgba(${cr},${cg},${cb},${a})`;
      c.lineWidth = 12 * a + 2;
      c.beginPath(); c.arc(wv.x, wv.y, r, 0, Math.PI * 2); c.stroke();
      if (r > 40) {
        c.strokeStyle = `rgba(127,217,154,${a * 0.75})`;
        c.lineWidth = 5 * a + 1;
        c.beginPath(); c.arc(wv.x, wv.y, r * 0.82, 0, Math.PI * 2); c.stroke();
      }
      if (wv.runes) {
        c.font = `700 ${Math.round(16 + 10 * a)}px "Cinzel", serif`;
        c.fillStyle = `rgba(255,248,225,${a})`;
        c.shadowColor = '#d4af37';
        c.shadowBlur = 14;
        for (let k = 0; k < RUNES.length; k++) {
          const ang = (Math.PI * 2 * k) / RUNES.length + wv.rot;
          c.fillText(RUNES[k], wv.x + Math.cos(ang) * r * 0.91, wv.y + Math.sin(ang) * r * 0.91);
        }
      }
      c.restore();
      if (wv.p >= 1) this.waves.splice(i, 1);
    }

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx; s.y += s.vy; s.vx *= 0.955; s.vy *= 0.955; s.a -= 0.017;
      if (s.a <= 0) { this.sparks.splice(i, 1); continue; }
      c.globalAlpha = s.a;
      c.fillStyle = s.c;
      c.shadowColor = s.c;
      c.shadowBlur = 12;
      if (s.rune) {
        c.font = '700 16px "Cinzel", serif';
        c.fillText(s.rune, s.x, s.y);
      } else {
        c.beginPath(); c.arc(s.x, s.y, s.r, 0, Math.PI * 2); c.fill();
      }
    }
    c.shadowBlur = 0;

    for (let i = this.dust.length - 1; i >= 0; i--) {
      const d = this.dust[i];
      d.x += d.vx; d.y += d.vy; d.vx *= 0.96; d.vy *= 0.97; d.r += d.grow; d.a -= 0.006;
      if (d.a <= 0) { this.dust.splice(i, 1); continue; }
      const g = c.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
      g.addColorStop(0, `rgba(232,214,180,${d.a})`);
      g.addColorStop(1, 'rgba(232,214,180,0)');
      c.globalAlpha = 1;
      c.fillStyle = g;
      c.beginPath(); c.arc(d.x, d.y, d.r, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }
}
