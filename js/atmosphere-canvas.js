/* ============================================================================
   ATMOSPHERE ENGINE — Zero-shadowBlur pre-baked sprite & compositor engine.
   Act 1 LoR Void ('arcana'), Act 2/3 motes ('meadow', 'table'), dust puffs,
   FR/EN radial shockwave, and decoupled 5★ Legendary Summon Burst VFX.
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
const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ'];
const ARCANA_GLYPHS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᛉ', 'ᛋ', '✦', '◇', '∆'];
const EMBER_COLORS = ['#ffd97d', '#f6c453', '#fff3c4'];
const SHARD_COLORS = ['#fff8dc', '#f6d365', '#d4af37', '#6ee7a8', '#2dd48f'];
const REVEAL_PETAL_COLORS = ['#fffaf0', '#ffe6a3', '#f7c6d0', '#ffe9c6'];

const PHI = (1 + Math.sqrt(5)) / 2;
const ICO_VERTS = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]
].map(([x, y, z]) => {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
});
const ICO_EDGES = [
  [0, 1], [0, 5], [0, 7], [0, 10], [0, 11], [1, 5], [1, 7], [1, 8], [1, 9],
  [2, 3], [2, 4], [2, 6], [2, 10], [2, 11], [3, 4], [3, 6], [3, 8], [3, 9],
  [4, 5], [4, 9], [4, 11], [5, 9], [5, 11], [6, 7], [6, 8], [6, 10],
  [7, 8], [7, 10], [8, 9], [10, 11]
];
const OCT_VERTS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const OCT_EDGES = [
  [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 4], [2, 5], [3, 4], [3, 5]
];

function toRgba(hex, a) {
  if (!hex.startsWith('#')) return hex;
  const h = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export class AtmosphereEngine {
  constructor(particleCanvas, fxCanvas) {
    this.pc = particleCanvas;
    this.px = particleCanvas.getContext('2d');
    this.fc = fxCanvas;
    this.fx = fxCanvas.getContext('2d');
    this.mode = 'arcana';
    this.tint = 'default';
    this.particles = [];
    this.arcanaParticles = [];
    this.petals = [];
    this.sparks = [];
    this.waves = [];
    this.dust = [];
    this.flares = [];
    this.slashes = [];
    this.shards = [];
    this.revealPetals = [];
    this.orbSprites = new Map();
    this.shardSprites = new Map();
    this._fxDirty = false;
    this.t = 0;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.buildSprites();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.seed();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  buildSprites() {
    // Warm up orb & shard caches
    [...EMBER_COLORS, ...PALETTES.fireflies, ...PALETTES.meadow, '#fff8e7', '#f7c948', '#7fd99a'].forEach((c) => this.getOrbSprite(c));
    SHARD_COLORS.forEach((c) => this.getShardSprite(c));

    // Pre-bake 256x256 8-spike golden-emerald starburst flare
    const fs = document.createElement('canvas');
    fs.width = 256;
    fs.height = 256;
    const fc = fs.getContext('2d');
    const cx = 128; const cy = 128;

    const glow = fc.createRadialGradient(cx, cy, 0, cx, cy, 120);
    glow.addColorStop(0, 'rgba(255, 252, 236, 0.94)');
    glow.addColorStop(0.24, 'rgba(247, 210, 100, 0.56)');
    glow.addColorStop(0.58, 'rgba(110, 231, 168, 0.18)');
    glow.addColorStop(1, 'rgba(247, 210, 100, 0)');
    fc.fillStyle = glow;
    fc.beginPath();
    fc.arc(cx, cy, 120, 0, Math.PI * 2);
    fc.fill();

    for (let s = 0; s < 8; s++) {
      const ang = (Math.PI * s) / 4;
      const len = s % 2 === 0 ? 124 : 78;
      const thick = s % 2 === 0 ? 11 : 6;
      fc.save();
      fc.translate(cx, cy);
      fc.rotate(ang);
      const sg = fc.createLinearGradient(-len, 0, len, 0);
      sg.addColorStop(0, 'rgba(255, 245, 200, 0)');
      sg.addColorStop(0.5, 'rgba(255, 252, 228, 0.92)');
      sg.addColorStop(1, 'rgba(255, 245, 200, 0)');
      fc.fillStyle = sg;
      fc.beginPath();
      fc.moveTo(-len, 0);
      fc.quadraticCurveTo(0, -thick, len, 0);
      fc.quadraticCurveTo(0, thick, -len, 0);
      fc.fill();
      fc.restore();
    }
    this.flareSprite = fs;
  }

  getOrbSprite(color) {
    if (this.orbSprites.has(color)) return this.orbSprites.get(color);
    const cv = document.createElement('canvas');
    cv.width = 48;
    cv.height = 48;
    const g = cv.getContext('2d');
    const rg = g.createRadialGradient(24, 24, 0, 24, 24, 24);
    rg.addColorStop(0, 'rgba(255, 255, 255, 1)');
    rg.addColorStop(0.24, toRgba(color, 0.92));
    rg.addColorStop(0.54, toRgba(color, 0.30));
    rg.addColorStop(1, toRgba(color, 0));
    g.fillStyle = rg;
    g.beginPath();
    g.arc(24, 24, 24, 0, Math.PI * 2);
    g.fill();
    this.orbSprites.set(color, cv);
    return cv;
  }

  getShardSprite(color) {
    if (this.shardSprites.has(color)) return this.shardSprites.get(color);
    const cv = document.createElement('canvas');
    cv.width = 56;
    cv.height = 28;
    const g = cv.getContext('2d');

    g.save();
    g.translate(28, 14);
    g.scale(1, 0.52);
    const halo = g.createRadialGradient(0, 0, 0, 0, 0, 26);
    halo.addColorStop(0, toRgba(color, 0.58));
    halo.addColorStop(1, toRgba(color, 0));
    g.fillStyle = halo;
    g.beginPath();
    g.arc(0, 0, 26, 0, Math.PI * 2);
    g.fill();
    g.restore();

    g.fillStyle = color;
    g.beginPath();
    g.moveTo(50, 14);
    g.lineTo(28, 19.5);
    g.lineTo(12, 14);
    g.lineTo(28, 8.5);
    g.closePath();
    g.fill();

    g.fillStyle = '#ffffff';
    g.beginPath();
    g.moveTo(41, 14);
    g.lineTo(28, 16.5);
    g.lineTo(19, 14);
    g.lineTo(28, 11.5);
    g.closePath();
    g.fill();

    this.shardSprites.set(color, cv);
    return cv;
  }

  resize() {
    const rawDpr = window.devicePixelRatio || 1;
    const pDpr = Math.min(rawDpr, 1.5);
    const fDpr = Math.min(rawDpr, 1.25);
    this.w = window.innerWidth;
    this.h = window.innerHeight;

    this.pc.width = Math.round(this.w * pDpr);
    this.pc.height = Math.round(this.h * pDpr);
    this.px.setTransform(pDpr, 0, 0, pDpr, 0, 0);

    this.fc.width = Math.round(this.w * fDpr);
    this.fc.height = Math.round(this.h * fDpr);
    this.fx.setTransform(fDpr, 0, 0, fDpr, 0, 0);

    if (this.arcanaParticles.length) this.seedArcana();
  }

  seed() {
    const count = this.reduced ? 14 : (this.w < 700 ? 26 : 46);
    this.particles = Array.from({ length: count }, () => this.makeParticle(true));
    this.petals = Array.from({ length: this.reduced ? 0 : 10 }, () => this.makePetal(true));
    this.seedArcana();
  }

  seedArcana() {
    const count = this.reduced ? 12 : (this.w <= 760 ? 28 : 50);
    this.arcanaParticles = Array.from({ length: count }, () => this.makeArcanaParticle(true));
  }

  makeArcanaParticle(anywhere = false) {
    const cx = this.w * 0.5;
    const cy = this.h * 0.47;
    const ang = Math.random() * Math.PI * 2;
    const rad = anywhere ? (14 + Math.random() * Math.min(this.w, this.h) * 0.42) : (16 + Math.random() * 140);
    const spd = 0.14 + Math.random() * 0.34;
    const roll = Math.random();
    const kind = roll < 0.45 ? 'ember' : roll < 0.65 ? 'poly' : roll < 0.83 ? 'rune' : 'wisp';
    const polyShape = Math.random() < 0.65 ? 'd20' : 'd8';
    const c = kind === 'ember'
      ? EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)]
      : kind === 'poly'
        ? (Math.random() < 0.55 ? 'rgba(236, 206, 130, 0.46)' : 'rgba(145, 192, 255, 0.42)')
        : kind === 'rune'
          ? (Math.random() < 0.55 ? '#ecd27a' : '#b7cdf2')
          : (Math.random() < 0.5 ? '#8ec0ff' : '#ffd97d');

    return {
      kind,
      polyShape,
      x: cx + Math.cos(ang) * rad,
      y: cy + Math.sin(ang) * rad * 0.78,
      vx: Math.cos(ang) * spd + (Math.random() - 0.5) * 0.14,
      vy: Math.sin(ang) * spd * 0.6 - (0.22 + Math.random() * 0.50),
      age: anywhere ? Math.random() * 240 : 0,
      maxAge: 260 + Math.random() * 220,
      r: kind === 'ember' ? (1.2 + Math.random() * 2.2) : (8 + Math.random() * 7),
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      vrX: (Math.random() - 0.5) * 0.014,
      vrY: (Math.random() - 0.5) * 0.018,
      ph: Math.random() * Math.PI * 2,
      glyph: ARCANA_GLYPHS[Math.floor(Math.random() * ARCANA_GLYPHS.length)],
      c,
      sprite: kind === 'ember' ? this.getOrbSprite(c) : null,
      trail: []
    };
  }

  palette() {
    if (this.mode === 'fireflies') return PALETTES.fireflies;
    if (this.mode === 'meadow') return PALETTES.meadow;
    return PALETTES[this.tint] || PALETTES.default;
  }

  makeParticle(anywhere = false) {
    const pal = this.palette();
    const c = pal[Math.floor(Math.random() * pal.length)];
    return {
      x: Math.random() * this.w,
      y: anywhere ? Math.random() * this.h : this.h + 10,
      r: 1 + Math.random() * 2.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.1 - Math.random() * 0.35,
      a: 0.25 + Math.random() * 0.55,
      ph: Math.random() * Math.PI * 2,
      c,
      sprite: this.getOrbSprite(c)
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
    const prev = this.mode;
    this.mode = mode;
    this.tint = tint;
    if (mode === 'arcana' && prev !== 'arcana') this.seedArcana();
    const pal = this.palette();
    this.particles.forEach((p) => {
      p.c = pal[Math.floor(Math.random() * pal.length)];
      p.sprite = this.getOrbSprite(p.c);
    });
  }

  setTint(tint) { this.setMode(this.mode, tint); }

  /* ------------------------------------------------------------ effects */
  burst(x, y, { count = 38, colors = ['#fff3c4', '#f6d77a', '#d4af37'], speed = 12 } = {}) {
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const sp = speed * (0.3 + Math.random() * 0.9);
      const col = colors[i % colors.length];
      this.sparks.push({
        x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        r: 1.5 + Math.random() * 3.5, a: 1,
        c: col,
        sprite: this.getOrbSprite(col)
      });
    }
  }

  dustPuff(x, y, width = 400) {
    for (let i = 0; i < 48; i++) {
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

  /* Optimized radial shockwave (used exclusively by FR <-> EN language toggle) */
  shockwave(x, y, { color = [247, 201, 72], runes = true } = {}) {
    const max = Math.hypot(Math.max(x, this.w - x), Math.max(y, this.h - y)) * 1.15;
    this.waves.push({ x, y, p: 0, max, color, runes, rot: 0 });
    this.burst(x, y, { count: 28, speed: 13, colors: ['#fff8e7', '#f7c948', '#7fd99a'] });
  }

  /* Dedicated Act 1 -> Act 2 Legendary Summon Burst VFX (zero shadowBlur) */
  legendaryReveal(x, y, isMobile = false) {
    this.sparks.length = 0;

    this.flares.push({
      x,
      y,
      p: 0,
      maxR: Math.max(this.w, this.h) * 0.54
    });

    const x1 = isMobile ? this.w * 0.85 : this.w * 0.63;
    const x2 = isMobile ? this.w * 0.15 : this.w * 0.37;
    const y1 = -this.h * 0.04;
    const y2 = this.h * 1.04;
    this.slashes.push({ x1, y1, x2, y2, p: 0 });

    // 36 faceted pre-baked diamond light shards erupting from silhouette & seam
    for (let i = 0; i < 36; i++) {
      const fromSeam = i >= 24;
      const t = Math.random();
      const ox = fromSeam ? (x1 + (x2 - x1) * t) : x;
      const oy = fromSeam ? (y1 + (y2 - y1) * t) : y;
      const ang = fromSeam
        ? ((Math.random() < 0.5 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.9)
        : ((Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.28);
      const sp = 6.5 + Math.random() * 17;
      const col = SHARD_COLORS[i % SHARD_COLORS.length];
      this.shards.push({
        x: ox,
        y: oy,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 1.2,
        len: 10 + Math.random() * 14,
        rot: ang,
        vr: (Math.random() - 0.5) * 0.18,
        a: 1,
        sprite: this.getShardSprite(col)
      });
    }

    // 16 outward drifting sunlit petals
    for (let i = 0; i < 16; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = 3 + Math.random() * 8.5;
      this.revealPetals.push({
        x,
        y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 1.5,
        s: 3.5 + Math.random() * 3.5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.08,
        ph: Math.random() * 6,
        a: 0.95,
        c: REVEAL_PETAL_COLORS[i % REVEAL_PETAL_COLORS.length]
      });
    }
  }

  /* ------------------------------------------------------------ loop */
  loop() {
    this.t += 0.016;
    this.drawParticles();
    this.drawFx();
    requestAnimationFrame(this.loop);
  }

  drawWirePoly(c, p) {
    const verts = p.polyShape === 'd8' ? OCT_VERTS : ICO_VERTS;
    const edges = p.polyShape === 'd8' ? OCT_EDGES : ICO_EDGES;
    const cosX = Math.cos(p.rotX); const sinX = Math.sin(p.rotX);
    const cosY = Math.cos(p.rotY); const sinY = Math.sin(p.rotY);
    const pts = verts.map(([vx, vy, vz]) => {
      const y1 = vy * cosX - vz * sinX;
      const z1 = vy * sinX + vz * cosX;
      const x2 = vx * cosY + z1 * sinY;
      return [p.x + x2 * p.r, p.y + y1 * p.r];
    });
    c.strokeStyle = p.c;
    c.lineWidth = 0.85;
    c.beginPath();
    for (let i = 0; i < edges.length; i++) {
      const [a, b] = edges[i];
      c.moveTo(pts[a][0], pts[a][1]);
      c.lineTo(pts[b][0], pts[b][1]);
    }
    c.stroke();
  }

  drawArcanaParticles(c) {
    for (const p of this.arcanaParticles) {
      p.age++;
      p.ph += 0.025;
      p.rotX += p.vrX;
      p.rotY += p.vrY;

      if (p.kind === 'wisp') {
        p.trail.push([p.x, p.y]);
        if (p.trail.length > 5) p.trail.shift();
        p.x += p.vx + Math.sin(p.ph * 1.4) * 0.42;
        p.y += p.vy;
      } else {
        p.x += p.vx + Math.sin(p.ph) * 0.16;
        p.y += p.vy;
      }

      if (p.age >= p.maxAge || p.x < -30 || p.x > this.w + 30 || p.y < -30 || p.y > this.h + 30) {
        Object.assign(p, this.makeArcanaParticle(false));
        continue;
      }

      const lifeRatio = p.age / p.maxAge;
      const env = lifeRatio < 0.15 ? lifeRatio / 0.15 : lifeRatio > 0.72 ? (1 - lifeRatio) / 0.28 : 1;
      const pulse = 0.72 + 0.28 * Math.sin(p.ph * 1.3);
      const alpha = Math.max(0, Math.min(1, env * pulse));

      if (p.kind === 'ember') {
        c.globalAlpha = alpha * 0.88;
        const sz = p.r * 7;
        c.drawImage(p.sprite, p.x - sz * 0.5, p.y - sz * 0.5, sz, sz);
      } else if (p.kind === 'poly') {
        c.globalAlpha = alpha * 0.95;
        this.drawWirePoly(c, p);
      } else if (p.kind === 'rune') {
        c.globalAlpha = alpha * 0.46;
        c.font = `600 ${Math.round(12 + (p.r % 4))}px "Cinzel", serif`;
        c.fillStyle = p.c;
        c.fillText(p.glyph, p.x, p.y);
      } else if (p.kind === 'wisp' && p.trail.length > 1) {
        c.globalAlpha = alpha * 0.48;
        c.strokeStyle = p.c;
        c.lineWidth = 1.6;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(p.trail[0][0], p.trail[0][1]);
        for (let k = 1; k < p.trail.length; k++) c.lineTo(p.trail[k][0], p.trail[k][1]);
        c.stroke();
      }
    }
    c.globalAlpha = 1;
  }

  drawParticles() {
    const c = this.px;
    c.clearRect(0, 0, this.w, this.h);

    if (this.mode === 'arcana') {
      this.drawArcanaParticles(c);
      return;
    }

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
      c.globalAlpha = Math.min(1, p.a * flick * 1.15);
      const sz = (firefly ? p.r * 1.2 : p.r) * 7;
      c.drawImage(p.sprite, p.x - sz * 0.5, p.y - sz * 0.5, sz, sz);
    }

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
    const active = this.waves.length || this.sparks.length || this.dust.length ||
      this.flares.length || this.slashes.length || this.shards.length || this.revealPetals.length;
    if (!active) {
      if (this._fxDirty) {
        this.fx.clearRect(0, 0, this.w, this.h);
        this._fxDirty = false;
      }
      return;
    }
    this._fxDirty = true;
    const c = this.fx;
    c.clearRect(0, 0, this.w, this.h);

    // 1. Concentric radial shockwaves (FR <-> EN toggle only, zero shadowBlur)
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const wv = this.waves[i];
      wv.p += 0.015;
      wv.rot += 0.022;
      const e = 1 - Math.pow(1 - Math.min(1, wv.p), 2.4);
      const r = 10 + e * wv.max;
      const a = Math.max(0, 1 - Math.pow(wv.p, 1.45));
      const [cr, cg, cb] = wv.color;

      c.strokeStyle = `rgba(${cr},${cg},${cb},${a * 0.22})`;
      c.lineWidth = 22 * a + 2;
      c.beginPath();
      c.arc(wv.x, wv.y, r, 0, Math.PI * 2);
      c.stroke();

      c.strokeStyle = `rgba(255,244,196,${a})`;
      c.lineWidth = 4 * a + 1.5;
      c.beginPath();
      c.arc(wv.x, wv.y, r, 0, Math.PI * 2);
      c.stroke();

      if (r > 36) {
        c.strokeStyle = `rgba(127,217,154,${a * 0.7})`;
        c.lineWidth = 2.5 * a + 1;
        c.beginPath();
        c.arc(wv.x, wv.y, r * 0.84, 0, Math.PI * 2);
        c.stroke();
      }

      if (wv.runes) {
        c.font = `700 ${Math.round(16 + 8 * a)}px "Cinzel", serif`;
        c.fillStyle = `rgba(255,248,225,${a})`;
        for (let k = 0; k < RUNES.length; k++) {
          const ang = (Math.PI * 2 * k) / RUNES.length + wv.rot;
          c.fillText(RUNES[k], wv.x + Math.cos(ang) * r * 0.91, wv.y + Math.sin(ang) * r * 0.91);
        }
      }
      if (wv.p >= 1) this.waves.splice(i, 1);
    }

    // 2. Single pre-baked 256x256 golden starburst flare (Legendary 5★ Reveal)
    if (this.flares.length) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (let i = this.flares.length - 1; i >= 0; i--) {
        const fl = this.flares[i];
        fl.p += 0.024;
        if (fl.p >= 1) { this.flares.splice(i, 1); continue; }
        const easeOut = 1 - Math.pow(1 - fl.p, 3);
        const a = Math.max(0, 1 - Math.pow(fl.p, 1.35));
        const r = fl.maxR * (0.24 + 0.76 * easeOut);
        c.save();
        c.globalAlpha = a;
        c.translate(fl.x, fl.y);
        c.rotate(fl.p * 0.18);
        c.drawImage(this.flareSprite, -r, -r, r * 2, r * 2);
        c.restore();
      }
      c.restore();
    }

    // 3. Single GPU gradient quad diagonal light-slash flash (Legendary 5★ Reveal)
    if (this.slashes.length) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (let i = this.slashes.length - 1; i >= 0; i--) {
        const sl = this.slashes[i];
        sl.p += 0.024;
        if (sl.p >= 1) { this.slashes.splice(i, 1); continue; }
        const cut = Math.min(1, sl.p * 3.8);
        const a = sl.p < 0.14 ? 1 : Math.max(0, 1 - (sl.p - 0.14) / 0.86);
        const ex = sl.x1 + (sl.x2 - sl.x1) * cut;
        const ey = sl.y1 + (sl.y2 - sl.y1) * cut;
        const dx = ex - sl.x1;
        const dy = ey - sl.y1;
        const len = Math.hypot(dx, dy);
        if (len > 1) {
          const ang = Math.atan2(dy, dx);
          const hw = Math.max(3, (1 - sl.p) * 52);
          c.save();
          c.translate(sl.x1, sl.y1);
          c.rotate(ang);
          c.globalAlpha = a;
          const sg = c.createLinearGradient(0, -hw, 0, hw);
          sg.addColorStop(0, 'rgba(110, 231, 168, 0)');
          sg.addColorStop(0.28, 'rgba(110, 231, 168, 0.34)');
          sg.addColorStop(0.44, 'rgba(247, 210, 100, 0.85)');
          sg.addColorStop(0.5, 'rgba(255, 255, 250, 1)');
          sg.addColorStop(0.56, 'rgba(247, 210, 100, 0.85)');
          sg.addColorStop(0.72, 'rgba(110, 231, 168, 0.34)');
          sg.addColorStop(1, 'rgba(110, 231, 168, 0)');
          c.fillStyle = sg;
          c.fillRect(0, -hw, len, hw * 2);
          c.restore();
        }
      }
      c.restore();
    }

    // 4. Pre-baked faceted diamond light shards (36 stamps, zero shadowBlur)
    if (this.shards.length) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (let i = this.shards.length - 1; i >= 0; i--) {
        const sh = this.shards[i];
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.vx *= 0.942;
        sh.vy *= 0.942;
        sh.rot += sh.vr;
        sh.a -= 0.019;
        if (sh.a <= 0) { this.shards.splice(i, 1); continue; }
        c.save();
        c.globalAlpha = sh.a;
        c.translate(sh.x, sh.y);
        c.rotate(sh.rot);
        c.drawImage(sh.sprite, -sh.len, -sh.len * 0.5, sh.len * 2, sh.len);
        c.restore();
      }
      c.restore();
    }

    // 5. Drifting celebration petals
    for (let i = this.revealPetals.length - 1; i >= 0; i--) {
      const rp = this.revealPetals[i];
      rp.ph += 0.05;
      rp.x += rp.vx + 0.35;
      rp.y += rp.vy + 0.15 * Math.sin(rp.ph);
      rp.vx *= 0.955;
      rp.vy *= 0.955;
      rp.rot += rp.vr;
      rp.a -= 0.011;
      if (rp.a <= 0) { this.revealPetals.splice(i, 1); continue; }
      c.save();
      c.globalAlpha = rp.a;
      c.translate(rp.x, rp.y);
      c.rotate(rp.rot);
      c.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(rp.ph)));
      c.fillStyle = rp.c;
      c.beginPath();
      c.ellipse(0, 0, rp.s * 1.45, rp.s * 0.8, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // 6. Standard orb-sprite sparks (zero shadowBlur)
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx; s.y += s.vy; s.vx *= 0.95; s.vy *= 0.95; s.a -= 0.022;
      if (s.a <= 0) { this.sparks.splice(i, 1); continue; }
      c.globalAlpha = s.a;
      const sz = s.r * 7;
      c.drawImage(s.sprite, s.x - sz * 0.5, s.y - sz * 0.5, sz, sz);
    }

    // 7. Book-drop dust puffs
    for (let i = this.dust.length - 1; i >= 0; i--) {
      const d = this.dust[i];
      d.x += d.vx; d.y += d.vy; d.vx *= 0.96; d.vy *= 0.97; d.r += d.grow; d.a -= 0.008;
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
